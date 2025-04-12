from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYER = "employer"
    CANDIDATE = "candidate"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_postings = relationship("JobPosting", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String)
    company = Column(String)
    description = Column(Text)
    skills_required = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="job_postings")
    matches = relationship("Match", back_populates="job_posting", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    file_path = Column(String)
    file_name = Column(String)
    file_type = Column(String)
    parsed_data = Column(Text)  # JSON string
    education = Column(Text)    # JSON string
    experience = Column(Text)   # JSON string
    skills = Column(Text)       # JSON string
    certifications = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    matches = relationship("Match", back_populates="resume", cascade="all, delete-orphan")

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("job_postings.id", ondelete="CASCADE"))
    resume_id = Column(String, ForeignKey("resumes.id", ondelete="CASCADE"))
    match_score = Column(Float)
    match_details = Column(Text)  # JSON string
    status = Column(String)  # pending, shortlisted, rejected, interviewing, hired
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_posting = relationship("JobPosting", back_populates="matches")
    resume = relationship("Resume", back_populates="matches")
    interviews = relationship("Interview", back_populates="match", cascade="all, delete-orphan")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    match_id = Column(String, ForeignKey("matches.id", ondelete="CASCADE"))
    scheduled_time = Column(DateTime)
    duration_minutes = Column(Integer)
    interview_type = Column(String)  # video, phone, in-person
    status = Column(String)  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    match = relationship("Match", back_populates="interviews") 