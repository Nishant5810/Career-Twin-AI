from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.career_models import User
from app.repositories.career_repository import ResumeRepository, SkillRepository, PredictionRepository
from app.services.mentor_service import mentor_service
from app.api.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/mentor", tags=["AI Career Mentor"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_mentor(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Interact with the AI Career Mentor RAG system.
    """
    # 1. Fetch user profile stats
    resume = await ResumeRepository.get_latest_by_user_id(db, current_user.id)
    skills = await SkillRepository.get_by_user_id(db, current_user.id)
    predictions = await PredictionRepository.get_career_predictions(db, current_user.id)

    # 2. Build profile dictionary for RAG context
    flat_skills = [s.name for s in skills]
    best_role = predictions[0].role if predictions else "ML Engineer"
    resume_score = resume.resume_score if resume else 87
    interview_score = min(95, int(resume_score * 0.85))

    user_profile = {
        "full_name": current_user.full_name or "Karthik",
        "skills": flat_skills if flat_skills else ["Python", "SQL", "Git", "Machine Learning"],
        "resume_score": resume_score,
        "interview_score": interview_score,
        "target_role": best_role
    }

    # 3. Get answer from RAG
    reply = mentor_service.answer_query(request.message, user_profile)
    
    return {"reply": reply}
