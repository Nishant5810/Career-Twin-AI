import os
import shutil
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.career_models import (
    User, Resume, Skill, CareerPrediction, SalaryPrediction, 
    LearningRoadmap, LearningRoadmapWeek, ProjectRecommendation
)
from app.repositories.career_repository import (
    ResumeRepository, SkillRepository, PredictionRepository,
    RoadmapRepository, ProjectRepository
)
from app.services.resume_service import ResumeService
from app.services.ml_service import ml_service
from app.api.schemas import ResumeAnalysisResponse

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and analyze resume. Extracts skills, calculates score, predicts career outcomes,
    and generates roadmap/projects.
    """
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF or DOCX."
        )

    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, f"user_{current_user.id}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {e}"
        )

    # Parse and extract
    try:
        parsed_data = ResumeService.parse_resume(file_path, file.filename)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # Clear user's previous profiles & skills for fresh upload analytics
    await SkillRepository.delete_by_user_id(db, current_user.id)
    await PredictionRepository.delete_predictions_by_user_id(db, current_user.id)
    await RoadmapRepository.delete_by_user_id(db, current_user.id)
    await ProjectRepository.delete_by_user_id(db, current_user.id)

    # 1. Create and Save Resume Record
    resume_db = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        resume_score=parsed_data["resume_score"],
        ats_score=parsed_data["ats_score"],
        extracted_text=parsed_data["text"],
        education=json.dumps(parsed_data["education"]),
        experience=json.dumps(parsed_data["experience"]),
        certifications=json.dumps(parsed_data["certifications"]),
        projects=json.dumps(parsed_data["projects"]),
        suggestions=json.dumps(parsed_data["suggestions"])
    )
    await ResumeRepository.create(db, resume_db)

    # 2. Save Extracted Skills
    skills_db = []
    flat_skills_list = []
    for category, items in parsed_data["skills"].items():
        for item in items:
            skill_db = Skill(
                user_id=current_user.id,
                category=category,
                name=item["name"],
                proficiency_level=item["proficiency_level"],
                maturity_score=item["maturity_score"]
            )
            skills_db.append(skill_db)
            flat_skills_list.append(item["name"])

    # Fallback to general list if no skills are matched
    if not flat_skills_list:
        flat_skills_list = ["Python", "SQL", "Git", "Machine Learning"]
        for s in flat_skills_list:
            skills_db.append(Skill(
                user_id=current_user.id,
                category="Technical Skills",
                name=s,
                proficiency_level="Intermediate",
                maturity_score=60
            ))
            
    await SkillRepository.create_bulk(db, skills_db)

    # 3. Predict Career Outcomes
    career_predictions = ml_service.predict_career_probabilities(flat_skills_list)
    top_predictions_db = []
    for pred in career_predictions:
        top_predictions_db.append(CareerPrediction(
            user_id=current_user.id,
            role=pred["role"],
            probability=pred["probability"] / 100.0
        ))
    await PredictionRepository.create_career_predictions(db, top_predictions_db)

    # Get the best fit role
    best_role = career_predictions[0]["role"]

    # 4. Predict Salary Trajectory
    salary_growth = ml_service.predict_salary_growth(flat_skills_list, best_role)
    salary_db = SalaryPrediction(
        user_id=current_user.id,
        role=best_role,
        current_salary=salary_growth["current_salary"],
        year_1_salary=salary_growth["year_1_salary"],
        year_3_salary=salary_growth["year_3_salary"],
        year_5_salary=salary_growth["year_5_salary"]
    )
    await PredictionRepository.create_salary_prediction(db, salary_db)

    # 5. Generate Personalized Learning Roadmap
    roadmap_db = LearningRoadmap(
        user_id=current_user.id,
        title=f"Personalized roadmap to {best_role}",
        duration_weeks=4,
        current_week=1,
        progress_percentage=0
    )
    await RoadmapRepository.create(db, roadmap_db)

    # Define weeks based on target role
    roadmap_topics = [
        {"week": 1, "topic": "Python Programming & Core Tools", "resources": [{"type": "documentation", "title": "Official Python Docs", "link": "https://docs.python.org/3/"}, {"type": "course", "title": "Coursera Python Crash Course", "link": "https://coursera.org"}]},
        {"week": 2, "topic": f"Foundational {best_role} Algorithms", "resources": [{"type": "book", "title": "Introduction to Algorithms", "link": "https://mitpress.mit.edu"}, {"type": "course", "title": "Advanced Data Structures & Design", "link": "https://udemy.com"}]},
        {"week": 3, "topic": "Framework Integrations & Deep Dives", "resources": [{"type": "documentation", "title": "Framework Documentation", "link": "https://fastapi.tiangolo.com"}]},
        {"week": 4, "topic": "MLOps, Containers & Cloud Deployments", "resources": [{"type": "course", "title": "Docker & Kubernetes Full Course", "link": "https://youtube.com"}, {"type": "project", "title": "Deploy API on AWS EC2", "link": "#"}]}
    ]
    # Customize for ML Engineers / Data Scientists
    if "ML" in best_role or "Data Scientist" in best_role:
        roadmap_topics[1]["topic"] = "Machine Learning Basics (Scikit-Learn)"
        roadmap_topics[2]["topic"] = "Deep Learning & Neural Networks (PyTorch)"
        roadmap_topics[3]["topic"] = "MLOps Pipeline Deployments (Docker & AWS)"

    weeks_db = []
    for rt in roadmap_topics:
        weeks_db.append(LearningRoadmapWeek(
            roadmap_id=roadmap_db.id,
            week_number=rt["week"],
            topic=rt["topic"],
            status="pending",
            resources_json=json.dumps(rt["resources"])
        ))
    await RoadmapRepository.create_weeks(db, weeks_db)

    # 6. Generate Project Recommendations
    projects_to_recommend = [
        {"title": f"Beginner: {best_role} Starter Project", "difficulty": "Beginner", "technologies": "Python, SQLite", "estimated_time": "1 week", "description": f"Build a local terminal dashboard tracking your daily tasks and data inputs styled around {best_role} metrics."},
        {"title": f"Intermediate: {best_role} Microservice", "difficulty": "Intermediate", "technologies": "FastAPI, Docker, MySQL", "estimated_time": "2 weeks", "description": "Create a fully containerized microservice that handles user profiles, stores data in MySQL, and exposes an API."},
        {"title": f"Advanced: AI {best_role} Optimization Engine", "difficulty": "Advanced", "technologies": "React, Tailwind, PyTorch, AWS", "estimated_time": "4 weeks", "description": "Implement a full-stack deep learning tool that monitors live prediction outcomes, renders interactive charts, and manages real-time scaling."}
    ]
    
    # Adjust names for ML Engineering roles
    if "ML" in best_role or "Data Scientist" in best_role:
        projects_to_recommend = [
            {"title": "Beginner: Spam Classifier API", "difficulty": "Beginner", "technologies": "Python, Scikit-learn, Flask", "estimated_time": "1 week", "description": "Train a simple Naive Bayes model to classify messages and wrap it inside a lightweight web API."},
            {"title": "Intermediate: Real-Time Demand Forecaster", "difficulty": "Intermediate", "technologies": "XGBoost, Pandas, FastAPI, Docker", "estimated_time": "2 weeks", "description": "Build an API that predicts product demand using time-series modeling, containerized with Docker and documented with OpenAPI."},
            {"title": "Advanced: Career Twin Simulation Engine", "difficulty": "Advanced", "technologies": "Next.js, Tailwind, FastAPI, PyTorch, AWS", "estimated_time": "4 weeks", "description": "Implement a full RAG career advisor chatbot and dynamic digital twin simulator showing career progress charts."}
        ]

    projects_db = []
    for proj in projects_to_recommend:
        projects_db.append(ProjectRecommendation(
            user_id=current_user.id,
            title=proj["title"],
            difficulty=proj["difficulty"],
            technologies=proj["technologies"],
            estimated_time=proj["estimated_time"],
            description=proj["description"],
            status="not_started"
        ))
    await ProjectRepository.create_bulk(db, projects_db)

    # Formulate response object
    return {
        "filename": file.filename,
        "resume_score": parsed_data["resume_score"],
        "ats_score": parsed_data["ats_score"],
        "skills": parsed_data["skills"],
        "education": parsed_data["education"],
        "experience": parsed_data["experience"],
        "certifications": parsed_data["certifications"],
        "projects": parsed_data["projects"],
        "suggestions": parsed_data["suggestions"]
    }
