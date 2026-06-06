import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.career_models import User, Simulation, JobMarketTrend
from app.repositories.career_repository import (
    ResumeRepository, SkillRepository, PredictionRepository,
    RoadmapRepository, ProjectRepository, MarketRepository, SimulationRepository
)
from app.services.ml_service import ml_service
from app.api.schemas import DashboardDataResponse, SimulationRequest, SimulationResponse, RoadmapOut, RoadmapWeekOut

router = APIRouter(prefix="/insights", tags=["Career Insights"])

@router.get("/dashboard", response_model=DashboardDataResponse)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all dashboard modules: Resume stats, skills breakdown, predictions, roadmap, 
    job trends, and a default digital twin simulation.
    """
    # 1. Fetch from database
    latest_resume = await ResumeRepository.get_latest_by_user_id(db, current_user.id)
    skills = await SkillRepository.get_by_user_id(db, current_user.id)
    career_predictions = await PredictionRepository.get_career_predictions(db, current_user.id)
    salary_predictions = await PredictionRepository.get_salary_predictions(db, current_user.id)
    roadmap = await RoadmapRepository.get_by_user_id(db, current_user.id)
    projects = await ProjectRepository.get_by_user_id(db, current_user.id)
    
    # Verify/populate Job Market Trends
    market_trends = await MarketRepository.get_all_trends(db)
    if not market_trends:
        default_trends = [
            JobMarketTrend(name="Generative AI", category="Technology", trend_type="Very High Demand", demand_score=95),
            JobMarketTrend(name="Machine Learning", category="Technology", trend_type="High Demand", demand_score=85),
            JobMarketTrend(name="Data Engineering", category="Technology", trend_type="High Demand", demand_score=80),
            JobMarketTrend(name="Blockchain", category="Technology", trend_type="Medium Demand", demand_score=55),
            JobMarketTrend(name="Data Entry", category="Technology", trend_type="Low Demand", demand_score=20)
        ]
        market_trends = await MarketRepository.create_bulk_trends(db, default_trends)

    # 2. If no resume exists, return the premium demo dashboard matching the user's reference image
    if not latest_resume:
        # Build Mock Demo Data mirroring reference image
        demo_stats = {
            "resume_score": 87,
            "resume_score_sparkline": [70, 75, 72, 80, 85, 87],
            "career_fit_score": 82,
            "career_fit_sparkline": [60, 65, 78, 80, 81, 82],
            "interview_ready_score": 74,
            "interview_ready_sparkline": [50, 55, 60, 68, 70, 74],
            "placement_probability_score": 78,
            "placement_probability_sparkline": [55, 60, 62, 70, 75, 78]
        }
        
        demo_skills = {
            "Technical Skills": [
                {"name": "Python", "proficiency_level": "Advanced", "maturity_score": 90},
                {"name": "SQL", "proficiency_level": "Advanced", "maturity_score": 85},
                {"name": "Git", "proficiency_level": "Intermediate", "maturity_score": 70},
                {"name": "Docker", "proficiency_level": "Intermediate", "maturity_score": 50}
            ],
            "ML Skills": [
                {"name": "Machine Learning", "proficiency_level": "Advanced", "maturity_score": 80},
                {"name": "Deep Learning", "proficiency_level": "Intermediate", "maturity_score": 70},
                {"name": "Scikit-Learn", "proficiency_level": "Advanced", "maturity_score": 85}
            ],
            "Soft Skills": [
                {"name": "Communication", "proficiency_level": "Advanced", "maturity_score": 80},
                {"name": "Teamwork", "proficiency_level": "Advanced", "maturity_score": 85}
            ],
            "Domain Skills": [
                {"name": "AWS", "proficiency_level": "Intermediate", "maturity_score": 60},
                {"name": "System Design", "proficiency_level": "Beginner", "maturity_score": 30}
            ]
        }
        
        demo_career = [
            {"role": "ML Engineer", "probability": 87.0},
            {"role": "Data Scientist", "probability": 81.0},
            {"role": "Software Engineer", "probability": 72.0},
            {"role": "Data Analyst", "probability": 65.0},
            {"role": "Cloud Engineer", "probability": 58.0},
            {"role": "Product Manager", "probability": 45.0}
        ]
        
        demo_salary = [
            {
                "role": "ML Engineer",
                "current_salary": 6.0,
                "year_1_salary": 8.5,
                "year_3_salary": 14.5,
                "year_5_salary": 22.0
            }
        ]
        
        demo_gaps = [
            {"skill": "Machine Learning", "importance": 80, "priority": "High Priority"},
            {"skill": "Deep Learning", "importance": 70, "priority": "High Priority"},
            {"skill": "AWS", "importance": 60, "priority": "Medium Priority"},
            {"skill": "Docker", "importance": 50, "priority": "Medium Priority"},
            {"skill": "System Design", "importance": 30, "priority": "Low Priority"}
        ]
        
        demo_roadmap = {
            "id": 0,
            "title": "Roadmap to ML Engineer",
            "duration_weeks": 4,
            "current_week": 2,
            "progress_percentage": 60,
            "weeks": [
                {"id": 1, "week_number": 1, "topic": "Python Advanced", "status": "completed", "resources": [{"type": "documentation", "title": "Advanced Python", "link": "#"}]},
                {"id": 2, "week_number": 2, "topic": "Machine Learning Basics", "status": "in_progress", "resources": [{"type": "course", "title": "Intro to ML", "link": "#"}]},
                {"id": 3, "week_number": 3, "topic": "Deep Learning", "status": "pending", "resources": [{"type": "course", "title": "PyTorch for Deep Learning", "link": "#"}]},
                {"id": 4, "week_number": 4, "topic": "MLOps with Docker", "status": "pending", "resources": [{"type": "course", "title": "MLOps with Docker & K8s", "link": "#"}]}
            ]
        }
        
        demo_projects = [
            {"id": 1, "title": "Spam Classifier API", "difficulty": "Beginner", "technologies": ["Python", "Scikit-Learn"], "estimated_time": "1 week", "description": "Train a simple Naive Bayes model to classify messages and wrap it inside a lightweight web API.", "status": "completed"},
            {"id": 2, "title": "Real-Time Demand Forecaster", "difficulty": "Intermediate", "technologies": ["XGBoost", "FastAPI", "Docker"], "estimated_time": "2 weeks", "description": "Build an API that predicts product demand using time-series modeling, containerized with Docker.", "status": "in_progress"},
            {"id": 3, "title": "Career Twin Simulation Engine", "difficulty": "Advanced", "technologies": ["Next.js", "FastAPI", "PyTorch", "AWS"], "estimated_time": "4 weeks", "description": "Implement a full RAG career advisor chatbot and dynamic digital twin simulator showing career progress charts.", "status": "not_started"}
        ]
        
        # Default digital twin preview (learning AWS in 3 months)
        default_twin = {
            "original_salary_3y": 14.5,
            "simulated_salary_3y": 16.5,
            "original_probability": 87.0,
            "simulated_probability": 92.0,
            "probability_increase": 24.0,
            "career_growth": "High",
            "timeline": [
                {"period": "Now", "original": 6.0, "simulated": 7.2},
                {"period": "1 Year", "original": 8.5, "simulated": 10.2},
                {"period": "3 Years", "original": 14.5, "simulated": 16.5},
                {"period": "5 Years", "original": 22.0, "simulated": 25.0}
            ]
        }
        
        return {
            "stats": demo_stats,
            "skills": demo_skills,
            "career_predictions": demo_career,
            "salary_predictions": demo_salary,
            "skill_gaps": demo_gaps,
            "roadmap": demo_roadmap,
            "projects": demo_projects,
            "market_trends": [{"name": t.name, "category": t.category, "trend_type": t.trend_type, "demand_score": t.demand_score} for t in market_trends],
            "digital_twin_default": default_twin
        }

    # 3. Compile DB records
    # Group skills
    grouped_skills = {"Technical Skills": [], "ML Skills": [], "Soft Skills": [], "Domain Skills": []}
    flat_skills = []
    for s in skills:
        cat = s.category
        if cat not in grouped_skills:
            grouped_skills[cat] = []
        grouped_skills[cat].append({
            "name": s.name,
            "proficiency_level": s.proficiency_level,
            "maturity_score": s.maturity_score
        })
        flat_skills.append(s.name)

    # Predictions formatting
    formatted_career = [{"role": cp.role, "probability": cp.probability * 100} for cp in career_predictions]
    formatted_salary = [{
        "role": sp.role,
        "current_salary": sp.current_salary,
        "year_1_salary": sp.year_1_salary,
        "year_3_salary": sp.year_3_salary,
        "year_5_salary": sp.year_5_salary
    } for sp in salary_predictions]

    # Skill gaps calculations
    best_role = career_predictions[0].role if career_predictions else "ML Engineer"
    skill_gaps = ml_service.analyze_skill_gaps(flat_skills, best_role)

    # Roadmap format
    formatted_roadmap = None
    if roadmap:
        formatted_roadmap = {
            "id": roadmap.id,
            "title": roadmap.title,
            "duration_weeks": roadmap.duration_weeks,
            "current_week": roadmap.current_week,
            "progress_percentage": roadmap.progress_percentage,
            "weeks": [{
                "id": w.id,
                "week_number": w.week_number,
                "topic": w.topic,
                "status": w.status,
                "resources": json.loads(w.resources_json) if w.resources_json else []
            } for w in roadmap.weeks]
        }

    # Projects list
    formatted_projects = [{
        "id": p.id,
        "title": p.title,
        "difficulty": p.difficulty,
        "technologies": [tech.strip() for tech in p.technologies.split(",") if tech.strip()],
        "estimated_time": p.estimated_time,
        "description": p.description,
        "status": p.status
    } for p in projects]

    # Metrics score calculation
    current_resume_score = latest_resume.resume_score
    current_ats_score = latest_resume.ats_score
    
    stats_data = {
        "resume_score": current_resume_score,
        "resume_score_sparkline": [current_resume_score - 10, current_resume_score - 5, current_resume_score - 2, current_resume_score],
        "career_fit_score": int(formatted_career[0]["probability"]) if formatted_career else 80,
        "career_fit_sparkline": [70, 72, 75, int(formatted_career[0]["probability"])] if formatted_career else [70, 75, 78, 80],
        "interview_ready_score": min(95, int(current_resume_score * 0.85)),
        "interview_ready_sparkline": [60, 62, 68, min(95, int(current_resume_score * 0.85))],
        "placement_probability_score": min(95, int(current_resume_score * 0.9)),
        "placement_probability_sparkline": [65, 70, 74, min(95, int(current_resume_score * 0.9))]
    }

    # Default digital twin preview (learning AWS in 3 months)
    default_twin = ml_service.run_digital_twin_simulation(
        flat_skills, 
        best_role, 
        aws_learned=True, 
        ml_projects_count=1, 
        azure_certified=False
    )

    return {
        "stats": stats_data,
        "skills": grouped_skills,
        "career_predictions": formatted_career,
        "salary_predictions": formatted_salary,
        "skill_gaps": skill_gaps,
        "roadmap": formatted_roadmap,
        "projects": formatted_projects,
        "market_trends": [{"name": t.name, "category": t.category, "trend_type": t.trend_type, "demand_score": t.demand_score} for t in market_trends],
        "digital_twin_default": default_twin
    }


@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run Digital Twin Career Simulation based on selected user inputs.
    """
    skills = await SkillRepository.get_by_user_id(db, current_user.id)
    flat_skills = [s.name for s in skills]
    
    # If no custom upload profiles exist, simulate using Karthik's baseline
    if not flat_skills:
        flat_skills = ["Python", "SQL", "Git", "Scikit-Learn"]
        
    outcome = ml_service.run_digital_twin_simulation(
        flat_skills,
        request.target_role,
        aws_learned=request.aws_learned,
        ml_projects_count=request.ml_projects_count,
        azure_certified=request.azure_certified
    )

    # Save simulation log
    sim_db = Simulation(
        user_id=current_user.id,
        scenario_description=f"Learn AWS: {request.aws_learned}, ML Projects: {request.ml_projects_count}, Azure Certified: {request.azure_certified}",
        aws_learned=request.aws_learned,
        ml_projects_count=request.ml_projects_count,
        azure_certified=request.azure_certified,
        original_salary=outcome["timeline"][2]["original"],
        simulated_salary=outcome["timeline"][2]["simulated"],
        original_probability=outcome["original_probability"] / 100.0,
        simulated_probability=outcome["simulated_probability"] / 100.0,
        original_growth="Normal",
        simulated_growth=outcome["career_growth"]
    )
    await SimulationRepository.create(db, sim_db)

    return outcome


@router.post("/roadmap/week/{week_id}")
async def update_roadmap_week_status(
    week_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update week status in learning roadmap (completed, in_progress, pending)
    and adjust total progress percentage.
    """
    if status not in ["completed", "in_progress", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status type.")
        
    week = await RoadmapRepository.update_week_status(db, week_id, status)
    if not week:
        raise HTTPException(status_code=404, detail="Roadmap week not found.")
        
    # Recalculate overall progress
    roadmap = await RoadmapRepository.get_by_user_id(db, current_user.id)
    if roadmap:
        completed_count = sum(1 for w in roadmap.weeks if w.status == "completed")
        new_progress = int((completed_count / len(roadmap.weeks)) * 100)
        await RoadmapRepository.update_roadmap_progress(db, roadmap.id, new_progress)
        return {"week_id": week_id, "status": status, "overall_progress": new_progress}
        
    return {"week_id": week_id, "status": status}
