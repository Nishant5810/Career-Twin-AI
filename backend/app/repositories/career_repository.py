from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional
from app.models.career_models import (
    User, Resume, Skill, CareerPrediction, 
    SalaryPrediction, LearningRoadmap, LearningRoadmapWeek,
    ProjectRecommendation, JobMarketTrend, Simulation
)

class UserRepository:
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, user: User) -> User:
        db.add(user)
        await db.flush()
        return user


class ResumeRepository:
    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> List[Resume]:
        stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_latest_by_user_id(db: AsyncSession, user_id: int) -> Optional[Resume]:
        stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc())
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, resume: Resume) -> Resume:
        db.add(resume)
        await db.flush()
        return resume


class SkillRepository:
    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> List[Skill]:
        stmt = select(Skill).where(Skill.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_bulk(db: AsyncSession, skills: List[Skill]) -> List[Skill]:
        db.add_all(skills)
        await db.flush()
        return skills

    @staticmethod
    async def delete_by_user_id(db: AsyncSession, user_id: int):
        stmt = delete(Skill).where(Skill.user_id == user_id)
        await db.execute(stmt)


class PredictionRepository:
    @staticmethod
    async def get_career_predictions(db: AsyncSession, user_id: int) -> List[CareerPrediction]:
        stmt = select(CareerPrediction).where(CareerPrediction.user_id == user_id).order_by(CareerPrediction.probability.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_salary_predictions(db: AsyncSession, user_id: int) -> List[SalaryPrediction]:
        stmt = select(SalaryPrediction).where(SalaryPrediction.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_latest_salary_prediction(db: AsyncSession, user_id: int, role: str) -> Optional[SalaryPrediction]:
        stmt = select(SalaryPrediction).where(SalaryPrediction.user_id == user_id, SalaryPrediction.role == role).order_by(SalaryPrediction.predicted_at.desc())
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_career_predictions(db: AsyncSession, predictions: List[CareerPrediction]) -> List[CareerPrediction]:
        db.add_all(predictions)
        await db.flush()
        return predictions

    @staticmethod
    async def create_salary_prediction(db: AsyncSession, prediction: SalaryPrediction) -> SalaryPrediction:
        db.add(prediction)
        await db.flush()
        return prediction

    @staticmethod
    async def delete_predictions_by_user_id(db: AsyncSession, user_id: int):
        await db.execute(delete(CareerPrediction).where(CareerPrediction.user_id == user_id))
        await db.execute(delete(SalaryPrediction).where(SalaryPrediction.user_id == user_id))


class RoadmapRepository:
    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> Optional[LearningRoadmap]:
        stmt = select(LearningRoadmap).where(LearningRoadmap.user_id == user_id).order_by(LearningRoadmap.created_at.desc())
        result = await db.execute(stmt)
        roadmap = result.scalars().first()
        if roadmap:
            # Eagerly load weeks
            stmt_weeks = select(LearningRoadmapWeek).where(LearningRoadmapWeek.roadmap_id == roadmap.id).order_by(LearningRoadmapWeek.week_number.asc())
            weeks_result = await db.execute(stmt_weeks)
            roadmap.weeks = list(weeks_result.scalars().all())
        return roadmap

    @staticmethod
    async def create(db: AsyncSession, roadmap: LearningRoadmap) -> LearningRoadmap:
        db.add(roadmap)
        await db.flush()
        return roadmap

    @staticmethod
    async def create_weeks(db: AsyncSession, weeks: List[LearningRoadmapWeek]) -> List[LearningRoadmapWeek]:
        db.add_all(weeks)
        await db.flush()
        return weeks

    @staticmethod
    async def update_week_status(db: AsyncSession, week_id: int, status: str) -> Optional[LearningRoadmapWeek]:
        stmt = select(LearningRoadmapWeek).where(LearningRoadmapWeek.id == week_id)
        result = await db.execute(stmt)
        week = result.scalars().first()
        if week:
            week.status = status
            await db.flush()
        return week

    @staticmethod
    async def update_roadmap_progress(db: AsyncSession, roadmap_id: int, progress: int) -> Optional[LearningRoadmap]:
        stmt = select(LearningRoadmap).where(LearningRoadmap.id == roadmap_id)
        result = await db.execute(stmt)
        roadmap = result.scalars().first()
        if roadmap:
            roadmap.progress_percentage = progress
            await db.flush()
        return roadmap

    @staticmethod
    async def delete_by_user_id(db: AsyncSession, user_id: int):
        stmt_roadmaps = select(LearningRoadmap).where(LearningRoadmap.user_id == user_id)
        res = await db.execute(stmt_roadmaps)
        roadmaps = res.scalars().all()
        for r in roadmaps:
            await db.execute(delete(LearningRoadmapWeek).where(LearningRoadmapWeek.roadmap_id == r.id))
            await db.delete(r)
        await db.flush()


class ProjectRepository:
    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> List[ProjectRecommendation]:
        stmt = select(ProjectRecommendation).where(ProjectRecommendation.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_bulk(db: AsyncSession, projects: List[ProjectRecommendation]) -> List[ProjectRecommendation]:
        db.add_all(projects)
        await db.flush()
        return projects

    @staticmethod
    async def delete_by_user_id(db: AsyncSession, user_id: int):
        stmt = delete(ProjectRecommendation).where(ProjectRecommendation.user_id == user_id)
        await db.execute(stmt)


class MarketRepository:
    @staticmethod
    async def get_all_trends(db: AsyncSession) -> List[JobMarketTrend]:
        stmt = select(JobMarketTrend).order_by(JobMarketTrend.demand_score.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_bulk_trends(db: AsyncSession, trends: List[JobMarketTrend]) -> List[JobMarketTrend]:
        # Perform upsert or insert if not exists
        for trend in trends:
            stmt = select(JobMarketTrend).where(JobMarketTrend.name == trend.name)
            res = await db.execute(stmt)
            existing = res.scalars().first()
            if existing:
                existing.trend_type = trend.trend_type
                existing.demand_score = trend.demand_score
            else:
                db.add(trend)
        await db.flush()
        return trends


class SimulationRepository:
    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> List[Simulation]:
        stmt = select(Simulation).where(Simulation.user_id == user_id).order_by(Simulation.simulated_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, simulation: Simulation) -> Simulation:
        db.add(simulation)
        await db.flush()
        return simulation
