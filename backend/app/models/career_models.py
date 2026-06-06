from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(100), default="Premium User")
    profile_picture = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    career_predictions = relationship("CareerPrediction", back_populates="user", cascade="all, delete-orphan")
    salary_predictions = relationship("SalaryPrediction", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("ProjectRecommendation", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    resume_score = Column(Integer, default=0)
    ats_score = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=True)
    
    # JSON-like fields or Text storage
    education = Column(Text, nullable=True)       # JSON string
    experience = Column(Text, nullable=True)      # JSON string
    certifications = Column(Text, nullable=True)  # JSON string
    projects = Column(Text, nullable=True)        # JSON string
    suggestions = Column(Text, nullable=True)     # JSON string

    # Relationships
    user = relationship("User", back_populates="resumes")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)  # "Technical", "Soft", "Domain", etc.
    name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate") # "Beginner", "Intermediate", "Advanced"
    maturity_score = Column(Integer, default=50) # 0-100 scale
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skills")


class CareerPrediction(Base):
    __tablename__ = "career_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)  # "ML Engineer", "Data Scientist", etc.
    probability = Column(Float, nullable=False)  # e.g., 0.87 for 87%
    predicted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="career_predictions")


class SalaryPrediction(Base):
    __tablename__ = "salary_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)
    current_salary = Column(Float, nullable=False) # In LPA (e.g. 6.0)
    year_1_salary = Column(Float, nullable=False)  # In LPA (e.g. 8.5)
    year_3_salary = Column(Float, nullable=False)  # In LPA (e.g. 14.5)
    year_5_salary = Column(Float, nullable=False)  # In LPA (e.g. 22.0)
    predicted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="salary_predictions")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    duration_weeks = Column(Integer, default=4)
    current_week = Column(Integer, default=1)
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="roadmaps")
    weeks = relationship("LearningRoadmapWeek", back_populates="roadmap", cascade="all, delete-orphan", lazy="selectin")


class LearningRoadmapWeek(Base):
    __tablename__ = "learning_roadmap_weeks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    topic = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # "completed", "pending", "in_progress"
    resources_json = Column(Text, nullable=True)     # JSON string of courses, books, projects

    # Relationships
    roadmap = relationship("LearningRoadmap", back_populates="weeks")


class ProjectRecommendation(Base):
    __tablename__ = "project_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False)  # "Beginner", "Intermediate", "Advanced"
    technologies = Column(String(255), nullable=False) # Comma separated or JSON
    estimated_time = Column(String(100), nullable=False) # e.g., "3 weeks"
    description = Column(Text, nullable=False)
    status = Column(String(50), default="not_started") # "not_started", "in_progress", "completed"

    # Relationships
    user = relationship("User", back_populates="projects")


class JobMarketTrend(Base):
    __tablename__ = "job_market_trends"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g., "Generative AI", "Machine Learning"
    category = Column(String(100), nullable=False)          # "Skill", "Technology"
    trend_type = Column(String(50), nullable=False)         # "Very High Demand", "High Demand", "Medium Demand", "Low Demand"
    demand_score = Column(Integer, default=50)              # 0-100 scale for charting
    created_at = Column(DateTime, default=datetime.utcnow)


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scenario_description = Column(String(255), nullable=False) # e.g. "If I learn AWS in 3 months"
    
    # Inputs/Parameters simulated
    aws_learned = Column(Boolean, default=False)
    ml_projects_count = Column(Integer, default=0)
    azure_certified = Column(Boolean, default=False)

    # Outcomes
    original_salary = Column(Float, nullable=False)
    simulated_salary = Column(Float, nullable=False)
    original_probability = Column(Float, nullable=False)
    simulated_probability = Column(Float, nullable=False)
    original_growth = Column(String(50), nullable=False) # e.g. "Normal", "High"
    simulated_growth = Column(String(50), nullable=False)
    
    simulated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="simulations")
