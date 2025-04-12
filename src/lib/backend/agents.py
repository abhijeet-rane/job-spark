from typing import Dict, List, Optional
import openai
from sentence_transformers import SentenceTransformer
import spacy
from .config import settings

# Initialize AI models
nlp = spacy.load("en_core_web_sm")
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
openai.api_key = settings.OPENAI_API_KEY

class JDAgent:
    @staticmethod
    async def summarize_jd(jd_text: str) -> Dict:
        """Summarize job description using GPT-4"""
        prompt = f"""Analyze this job description and extract key information:
        {jd_text}
        
        Provide a structured summary with:
        1. Required skills
        2. Experience level
        3. Key responsibilities
        4. Qualifications
        5. Role type
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            "summary": response.choices[0].message.content,
            "raw_text": jd_text
        }
    
    @staticmethod
    def extract_skills(jd_text: str) -> List[str]:
        """Extract skills from job description using spaCy"""
        doc = nlp(jd_text)
        skills = []
        
        # Extract noun phrases and technical terms
        for chunk in doc.noun_chunks:
            if any(keyword in chunk.text.lower() for keyword in ["skill", "experience", "knowledge"]):
                skills.append(chunk.text)
        
        return list(set(skills))

class ResumeAgent:
    @staticmethod
    async def parse_resume(resume_text: str) -> Dict:
        """Parse resume using GPT-4"""
        prompt = f"""Parse this resume and extract structured information:
        {resume_text}
        
        Provide:
        1. Personal information
        2. Education history
        3. Work experience
        4. Skills
        5. Certifications
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            "parsed_data": response.choices[0].message.content,
            "raw_text": resume_text
        }

class MatchingAgent:
    @staticmethod
    def calculate_match_score(jd_embedding: List[float], resume_embedding: List[float]) -> float:
        """Calculate similarity score between JD and resume embeddings"""
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        score = cosine_similarity(
            np.array(jd_embedding).reshape(1, -1),
            np.array(resume_embedding).reshape(1, -1)
        )[0][0]
        
        return float(score * 100)  # Convert to percentage
    
    @staticmethod
    def get_embeddings(text: str) -> List[float]:
        """Get sentence embeddings for text"""
        return sentence_model.encode(text).tolist()
    
    @staticmethod
    async def analyze_match(jd_text: str, resume_text: str) -> Dict:
        """Analyze match between JD and resume"""
        jd_embedding = MatchingAgent.get_embeddings(jd_text)
        resume_embedding = MatchingAgent.get_embeddings(resume_text)
        
        match_score = MatchingAgent.calculate_match_score(jd_embedding, resume_embedding)
        
        # Get detailed analysis from GPT-4
        prompt = f"""Analyze the match between this job description and resume:
        
        Job Description:
        {jd_text}
        
        Resume:
        {resume_text}
        
        Provide a detailed analysis of:
        1. Overall match score: {match_score}%
        2. Key matching skills
        3. Missing skills
        4. Experience alignment
        5. Recommendations
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            "match_score": match_score,
            "analysis": response.choices[0].message.content,
            "jd_embedding": jd_embedding,
            "resume_embedding": resume_embedding
        }

class InterviewSchedulerAgent:
    @staticmethod
    async def generate_interview_email(
        candidate_name: str,
        job_title: str,
        company_name: str,
        interview_time: str,
        interview_type: str
    ) -> str:
        """Generate personalized interview invitation email"""
        prompt = f"""Generate a professional interview invitation email for:
        Candidate: {candidate_name}
        Job: {job_title}
        Company: {company_name}
        Time: {interview_time}
        Type: {interview_type}
        
        Make it warm, professional, and include all necessary details.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.choices[0].message.content 