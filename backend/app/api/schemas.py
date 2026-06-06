from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None


# Metric Sparkline Data
class SparklineData(BaseModel):
    name: str
    value: float


# Skill Schema
class SkillItem(BaseModel):
    name: str
    proficiency_level: str
    maturity_score: int

class SkillCategories(BaseModel):
    technical_skills: List[SkillItem] = Field(default_factory=list, alias="Technical Skills")
    ml_skills: List[SkillItem] = Field(default_factory=list, alias="ML Skills")
    soft_skills: List[SkillItem] = Field(default_factory=list, alias="Soft Skills")
    domain_skills: List[SkillItem] = Field(default_factory=list, alias="Domain Skills")

    class Config:
        populate_by_name = True


# Career & Salary predictions
class CareerPredictionOut(BaseModel):
    role: str
    probability: float

class SalaryPredictionOut(BaseModel):
    role: str
    current_salary: float
    year_1_salary: float
    year_3_salary: float
    year_5_salary: float

class SkillGapOut(BaseModel):
    skill: str
    importance: int
    priority: str


# Roadmap Schemas
class RoadmapWeekOut(BaseModel):
    id: int
    week_number: int
    topic: str
    status: str
    resources: List[Dict[str, Any]]

class RoadmapOut(BaseModel):
    id: int
    title: str
    duration_weeks: int
    current_week: int
    progress_percentage: int
    weeks: List[RoadmapWeekOut]


# Project Recommendations
class ProjectRecommendationOut(BaseModel):
    id: int
    title: str
    difficulty: str
    technologies: List[str]
    estimated_time: str
    description: str
    status: str


# Market Trends
class MarketTrendOut(BaseModel):
    name: str
    category: str
    trend_type: str
    demand_score: int


# Resume Analysis Response
class ResumeAnalysisResponse(BaseModel):
    filename: str
    resume_score: int
    ats_score: int
    skills: Dict[str, List[SkillItem]]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    certifications: List[str]
    projects: List[Dict[str, Any]]
    suggestions: List[str]


# Career Digital Twin Simulation
class SimulationRequest(BaseModel):
    target_role: str = "ML Engineer"
    aws_learned: bool = False
    ml_projects_count: int = 0
    azure_certified: bool = False

class TimelinePoint(BaseModel):
    period: str
    original: float
    simulated: float

class SimulationResponse(BaseModel):
    original_salary_3y: float
    simulated_salary_3y: float
    original_probability: float
    simulated_probability: float
    probability_increase: float
    career_growth: str
    timeline: List[TimelinePoint]


# AI Mentor Chat
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str


# Core Dashboard Response (Matches Reference Image Stats)
class DashboardStats(BaseModel):
    resume_score: int
    resume_score_sparkline: List[float]
    career_fit_score: int
    career_fit_sparkline: List[float]
    interview_ready_score: int
    interview_ready_sparkline: List[float]
    placement_probability_score: int
    placement_probability_sparkline: List[float]

class DashboardDataResponse(BaseModel):
    stats: DashboardStats
    skills: Dict[str, List[SkillItem]]
    career_predictions: List[CareerPredictionOut]
    salary_predictions: List[SalaryPredictionOut]
    skill_gaps: List[SkillGapOut]
    roadmap: Optional[RoadmapOut] = None
    projects: List[ProjectRecommendationOut]
    market_trends: List[MarketTrendOut]
    digital_twin_default: SimulationResponse
