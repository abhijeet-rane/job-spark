from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import models
import uuid

class DatabaseService:
    async def create_job_posting(
        self,
        db: Session,
        user_id: str,
        title: str,
        company: str,
        description: str,
        skills_required: List[str]
    ) -> models.JobPosting:
        """Create a new job posting"""
        job_posting = models.JobPosting(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            company=company,
            description=description,
            skills_required=json.dumps(skills_required)
        )
        db.add(job_posting)
        db.commit()
        db.refresh(job_posting)
        return job_posting

    async def create_resume(
        self,
        db: Session,
        user_id: str,
        file_path: str,
        file_name: str,
        file_type: str,
        parsed_data: Dict[str, Any],
        education: List[Dict[str, Any]],
        experience: List[Dict[str, Any]],
        skills: List[str],
        certifications: List[str]
    ) -> models.Resume:
        """Create a new resume entry"""
        resume = models.Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            file_path=file_path,
            file_name=file_name,
            file_type=file_type,
            parsed_data=json.dumps(parsed_data),
            education=json.dumps(education),
            experience=json.dumps(experience),
            skills=json.dumps(skills),
            certifications=json.dumps(certifications)
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    async def create_match(
        self,
        db: Session,
        job_id: str,
        resume_id: str,
        match_score: float,
        match_details: Dict[str, Any]
    ) -> models.Match:
        """Create a new match"""
        match = models.Match(
            id=str(uuid.uuid4()),
            job_id=job_id,
            resume_id=resume_id,
            match_score=match_score,
            match_details=json.dumps(match_details),
            status="pending"
        )
        db.add(match)
        db.commit()
        db.refresh(match)
        return match

    async def create_interview(
        self,
        db: Session,
        match_id: str,
        scheduled_time: datetime,
        duration_minutes: int,
        interview_type: str
    ) -> models.Interview:
        """Create a new interview"""
        interview = models.Interview(
            id=str(uuid.uuid4()),
            match_id=match_id,
            scheduled_time=scheduled_time,
            duration_minutes=duration_minutes,
            interview_type=interview_type,
            status="scheduled"
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    async def get_job_posting(self, db: Session, job_id: str) -> Optional[models.JobPosting]:
        """Get job posting by ID"""
        return db.query(models.JobPosting).filter(models.JobPosting.id == job_id).first()

    async def get_resume(self, db: Session, resume_id: str) -> Optional[models.Resume]:
        """Get resume by ID"""
        return db.query(models.Resume).filter(models.Resume.id == resume_id).first()

    async def get_match(self, db: Session, match_id: str) -> Optional[models.Match]:
        """Get match by ID"""
        return db.query(models.Match).filter(models.Match.id == match_id).first()

    async def get_shortlisted_candidates(
        self,
        db: Session,
        job_id: str,
        min_score: float = 70.0
    ) -> List[Dict[str, Any]]:
        """Get shortlisted candidates for a job"""
        matches = db.query(models.Match).filter(
            models.Match.job_id == job_id,
            models.Match.match_score >= min_score
        ).all()
        
        shortlisted = []
        for match in matches:
            resume = await self.get_resume(db, match.resume_id)
            if resume:
                user = db.query(models.User).filter(models.User.id == resume.user_id).first()
                if user:
                    shortlisted.append({
                        "match_id": match.id,
                        "candidate_name": user.full_name,
                        "match_score": match.match_score,
                        "match_details": json.loads(match.match_details) if match.match_details else {},
                        "resume_id": resume.id
                    })
        
        return shortlisted

    async def update_match_status(self, db: Session, match_id: str, status: str) -> None:
        """Update match status"""
        match = await self.get_match(db, match_id)
        if match:
            match.status = status
            db.commit()

    async def get_admin_stats(self, db: Session) -> Dict[str, Any]:
        """Get admin dashboard statistics"""
        total_jobs = db.query(models.JobPosting).count()
        total_resumes = db.query(models.Resume).count()
        total_matches = db.query(models.Match).count()
        total_interviews = db.query(models.Interview).count()
        
        avg_match_score = db.query(models.Match).with_entities(
            db.func.avg(models.Match.match_score)
        ).scalar() or 0
        
        return {
            "total_jobs": total_jobs,
            "total_resumes": total_resumes,
            "total_matches": total_matches,
            "total_interviews": total_interviews,
            "avg_match_score": float(avg_match_score)
        } 