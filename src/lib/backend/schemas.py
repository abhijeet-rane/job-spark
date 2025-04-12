from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
from .models import UserRole

def json_string_to_list(value: str) -> List[str]:
    if not value:
        return []
    return json.loads(value)

def json_string_to_dict(value: str) -> Dict[str, Any]:
    if not value:
        return {}
    return json.loads(value)

class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobPostingBase(BaseModel):
    title: str
    company: str
    description: str
    skills_required: List[str]

    class Config:
        from_attributes = True

class JobPostingCreate(JobPostingBase):
    user_id: str

class JobPosting(JobPostingBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, obj):
        if isinstance(obj.skills_required, str):
            obj.skills_required = json_string_to_list(obj.skills_required)
        return super().from_orm(obj)

    class Config:
        from_attributes = True

class ResumeBase(BaseModel):
    file_path: str
    file_name: str
    file_type: str

class ResumeCreate(ResumeBase):
    user_id: str

class Resume(ResumeBase):
    id: str
    user_id: str
    parsed_data: Dict[str, Any] = Field(default_factory=dict)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, obj):
        # Convert JSON strings to Python objects
        if isinstance(obj.parsed_data, str):
            obj.parsed_data = json_string_to_dict(obj.parsed_data)
        if isinstance(obj.education, str):
            obj.education = json_string_to_dict(obj.education)
        if isinstance(obj.experience, str):
            obj.experience = json_string_to_dict(obj.experience)
        if isinstance(obj.skills, str):
            obj.skills = json_string_to_list(obj.skills)
        if isinstance(obj.certifications, str):
            obj.certifications = json_string_to_list(obj.certifications)
        return super().from_orm(obj)

    class Config:
        from_attributes = True

class MatchBase(BaseModel):
    job_id: str
    resume_id: str

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: str
    match_score: float
    match_details: Dict[str, Any] = Field(default_factory=dict)
    status: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, obj):
        if isinstance(obj.match_details, str):
            obj.match_details = json_string_to_dict(obj.match_details)
        return super().from_orm(obj)

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    match_id: str
    scheduled_time: datetime
    duration_minutes: int
    interview_type: str

class InterviewCreate(InterviewBase):
    pass

class Interview(InterviewBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 