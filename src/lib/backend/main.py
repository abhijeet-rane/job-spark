from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uvicorn
import uuid

from . import models, auth, schemas
from .database import engine, get_db
from .agents import JDAgent, ResumeAgent, MatchingAgent, InterviewSchedulerAgent
from .config import settings
from .email import send_interview_invitation
from .services.cv_processor import CVProcessor
from .services.matcher import Matcher
from .services.database import DatabaseService

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JobSpark API",
    description="API for job matching and interview scheduling",
    version="1.0.0"
)

# Initialize services
cv_processor = CVProcessor()
matcher = Matcher()
db_service = DatabaseService()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Authentication routes
@app.post("/token")
async def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register(
    email: str,
    password: str,
    full_name: str,
    role: models.UserRole,
    db: Session = Depends(get_db)
):
    # Check if user exists
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(password)
    user = models.User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "User created successfully"}

# Job Posting routes
@app.post("/job-postings")
async def create_job_posting(
    title: str,
    company: str,
    description: str,
    skills_required: List[str],
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Process JD with AI
    jd_summary = await JDAgent.summarize_jd(description)
    extracted_skills = JDAgent.extract_skills(description)
    
    # Create job posting
    job_posting = await db_service.create_job_posting(
        db=db,
        user_id=current_user.id,
        title=title,
        company=company,
        description=description,
        skills_required=skills_required
    )
    
    return {
        "job_posting": job_posting,
        "ai_summary": jd_summary,
        "extracted_skills": extracted_skills
    }

# Resume routes
@app.post("/resumes")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Save file
    file_path = f"uploads/{current_user.id}_{file.filename}"
    content = await file.read()
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Extract text from CV
    cv_text = cv_processor.extract_text(content, file.content_type)
    
    # Parse resume with AI
    parsed_data = await ResumeAgent.parse_resume(cv_text)
    
    # Structure CV data
    structured_data = cv_processor.structure_cv_data(cv_text, parsed_data)
    
    # Save to database
    resume = await db_service.create_resume(
        db=db,
        user_id=current_user.id,
        file_path=file_path,
        file_name=file.filename,
        file_type=file.content_type,
        parsed_data=structured_data["parsed_data"],
        education=structured_data["education"],
        experience=structured_data["experience"],
        skills=structured_data["skills"],
        certifications=structured_data["certifications"]
    )
    
    return {
        "resume": resume,
        "parsed_data": structured_data
    }

# Matching routes
@app.post("/matches")
async def create_match(
    job_id: str,
    resume_id: str,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get job and resume
    job = await db_service.get_job_posting(db, job_id)
    resume = await db_service.get_resume(db, resume_id)
    
    if not job or not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job or resume not found"
        )
    
    # Prepare data for matching
    job_data = {
        "title": job.title,
        "description": job.description,
        "skills_required": json.loads(job.skills_required)
    }
    
    cv_data = {
        "raw_text": resume.parsed_data,
        "skills": json.loads(resume.skills),
        "experience": json.loads(resume.experience),
        "education": json.loads(resume.education)
    }
    
    # Perform matching
    match_result = await matcher.match_cv_with_job(job_data, cv_data)
    
    # Save match result
    match = await db_service.create_match(
        db=db,
        job_id=job_id,
        resume_id=resume_id,
        match_score=match_result["match_score"],
        match_details=match_result
    )
    
    return {
        "match": match,
        "analysis": match_result
    }

@app.get("/shortlist")
async def get_shortlisted_candidates(
    job_id: str,
    min_score: float = 70.0,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    shortlisted = await db_service.get_shortlisted_candidates(db, job_id, min_score)
    return {"shortlisted": shortlisted}

# Interview routes
@app.post("/interviews")
async def schedule_interview(
    match_id: str,
    scheduled_time: datetime,
    duration_minutes: int,
    interview_type: str,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get match and related data
    match = await db_service.get_match(db, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    # Get resume and job details
    resume = await db_service.get_resume(db, match.resume_id)
    job = await db_service.get_job_posting(db, match.job_id)
    candidate = db.query(models.User).filter(models.User.id == resume.user_id).first()
    
    # Generate interview email
    email_content = await InterviewSchedulerAgent.generate_interview_email(
        candidate_name=candidate.full_name,
        job_title=job.title,
        company_name=job.company,
        interview_time=scheduled_time.isoformat(),
        interview_type=interview_type
    )
    
    # Send interview invitation email
    email_sent = await send_interview_invitation(
        candidate_email=candidate.email,
        candidate_name=candidate.full_name,
        job_title=job.title,
        company_name=job.company,
        interview_time=scheduled_time.isoformat(),
        interview_type=interview_type,
        email_content=email_content
    )
    
    # Create interview record
    interview = await db_service.create_interview(
        db=db,
        match_id=match_id,
        scheduled_time=scheduled_time,
        duration_minutes=duration_minutes,
        interview_type=interview_type
    )
    
    # Update match status
    await db_service.update_match_status(db, match_id, "interviewing")
    
    return {
        "interview": interview,
        "email_content": email_content,
        "email_sent": email_sent
    }

# Admin routes
@app.get("/admin/stats")
async def get_admin_stats(
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    return await db_service.get_admin_stats(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to JobSpark API"}

@app.post("/users/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=user.password,  # Note: In production, hash the password!
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[schemas.User])
async def get_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.post("/job-postings/", response_model=schemas.JobPosting)
async def create_job_posting_schema(
    job: schemas.JobPostingCreate,
    db: Session = Depends(get_db)
):
    return await db_service.create_job_posting(
        db,
        user_id=job.user_id,
        title=job.title,
        company=job.company,
        description=job.description,
        skills_required=job.skills_required
    )

@app.get("/job-postings/", response_model=List[schemas.JobPosting])
async def get_job_postings_schema(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    jobs = db.query(models.JobPosting).offset(skip).limit(limit).all()
    return jobs

@app.post("/resumes/", response_model=schemas.Resume)
async def create_resume_schema(
    resume: schemas.ResumeCreate,
    db: Session = Depends(get_db)
):
    # Process the resume file and extract information
    parsed_data = await cv_processor.process_resume(resume.file_path)
    
    return await db_service.create_resume(
        db,
        user_id=resume.user_id,
        file_path=resume.file_path,
        file_name=resume.file_name,
        file_type=resume.file_type,
        parsed_data=parsed_data,
        education=parsed_data.get("education", []),
        experience=parsed_data.get("experience", []),
        skills=parsed_data.get("skills", []),
        certifications=parsed_data.get("certifications", [])
    )

@app.get("/resumes/", response_model=List[schemas.Resume])
async def get_resumes_schema(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    resumes = db.query(models.Resume).offset(skip).limit(limit).all()
    return resumes

@app.post("/matches/", response_model=schemas.Match)
async def create_match_schema(
    match: schemas.MatchCreate,
    db: Session = Depends(get_db)
):
    # Get job posting and resume
    job_posting = await db_service.get_job_posting(db, match.job_id)
    resume = await db_service.get_resume(db, match.resume_id)
    
    if not job_posting or not resume:
        raise HTTPException(status_code=404, detail="Job posting or resume not found")
    
    # Calculate match score
    match_score, match_details = await matcher.calculate_match(job_posting, resume)
    
    return await db_service.create_match(
        db,
        job_id=match.job_id,
        resume_id=match.resume_id,
        match_score=match_score,
        match_details=match_details
    )

@app.get("/matches/", response_model=List[schemas.Match])
async def get_matches_schema(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    matches = db.query(models.Match).offset(skip).limit(limit).all()
    return matches

@app.post("/interviews/", response_model=schemas.Interview)
async def create_interview_schema(
    interview: schemas.InterviewCreate,
    db: Session = Depends(get_db)
):
    return await db_service.create_interview(
        db,
        match_id=interview.match_id,
        scheduled_time=interview.scheduled_time,
        duration_minutes=interview.duration_minutes,
        interview_type=interview.interview_type
    )

@app.get("/interviews/", response_model=List[schemas.Interview])
async def get_interviews_schema(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    interviews = db.query(models.Interview).offset(skip).limit(limit).all()
    return interviews

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 