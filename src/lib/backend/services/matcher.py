from typing import Dict, List, Any
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from ..agents import MatchingAgent

class Matcher:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.nlp = spacy.load("en_core_web_sm")
        self.matching_agent = MatchingAgent()

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using spaCy"""
        doc = self.nlp(text)
        skills = []
        
        # Extract noun phrases that might be skills
        for chunk in doc.noun_chunks:
            if any(keyword in chunk.text.lower() for keyword in ["skill", "experience", "knowledge", "proficiency"]):
                skills.append(chunk.text.strip())
        
        return list(set(skills))

    def calculate_skill_match(self, job_skills: List[str], cv_skills: List[str]) -> float:
        """Calculate skill match percentage"""
        if not job_skills or not cv_skills:
            return 0.0
        
        # Convert skills to embeddings
        job_embeddings = self.model.encode(job_skills)
        cv_embeddings = self.model.encode(cv_skills)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(job_embeddings, cv_embeddings)
        
        # Get best match for each job skill
        best_matches = np.max(similarity_matrix, axis=1)
        
        # Calculate average match score
        return float(np.mean(best_matches) * 100)

    def calculate_experience_match(self, job_description: str, cv_experience: List[Dict]) -> float:
        """Calculate experience match percentage"""
        if not cv_experience:
            return 0.0
        
        # Combine all experience descriptions
        experience_text = " ".join([exp.get("description", "") for exp in cv_experience])
        
        # Calculate similarity between job description and experience
        job_embedding = self.model.encode([job_description])
        exp_embedding = self.model.encode([experience_text])
        
        similarity = cosine_similarity(job_embedding, exp_embedding)[0][0]
        return float(similarity * 100)

    async def match_cv_with_job(self, 
                              job_data: Dict[str, Any], 
                              cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Match CV with job posting and return detailed analysis"""
        
        # Extract skills
        job_skills = job_data.get("skills_required", [])
        cv_skills = cv_data.get("skills", [])
        
        # Calculate different match components
        skill_match = self.calculate_skill_match(job_skills, cv_skills)
        experience_match = self.calculate_experience_match(
            job_data.get("description", ""),
            cv_data.get("experience", [])
        )
        
        # Get detailed AI analysis
        analysis = await self.matching_agent.analyze_match(
            job_data.get("description", ""),
            cv_data.get("raw_text", "")
        )
        
        # Calculate overall match score
        overall_score = (skill_match * 0.6 + experience_match * 0.4)
        
        return {
            "match_score": overall_score,
            "skill_match": skill_match,
            "experience_match": experience_match,
            "analysis": analysis.get("analysis", ""),
            "matching_details": {
                "matched_skills": self._get_matching_skills(job_skills, cv_skills),
                "missing_skills": self._get_missing_skills(job_skills, cv_skills),
                "experience_analysis": self._analyze_experience(
                    job_data.get("description", ""),
                    cv_data.get("experience", [])
                )
            }
        }

    def _get_matching_skills(self, job_skills: List[str], cv_skills: List[str]) -> List[str]:
        """Get list of matching skills"""
        return [skill for skill in job_skills if any(
            self._is_skill_match(skill, cv_skill) for cv_skill in cv_skills
        )]

    def _get_missing_skills(self, job_skills: List[str], cv_skills: List[str]) -> List[str]:
        """Get list of missing skills"""
        return [skill for skill in job_skills if not any(
            self._is_skill_match(skill, cv_skill) for cv_skill in cv_skills
        )]

    def _is_skill_match(self, skill1: str, skill2: str) -> bool:
        """Check if two skills match using embedding similarity"""
        embeddings = self.model.encode([skill1, skill2])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return similarity > 0.8

    def _analyze_experience(self, job_description: str, cv_experience: List[Dict]) -> Dict[str, Any]:
        """Analyze experience match in detail"""
        return {
            "total_years": sum(float(exp.get("duration_years", 0)) for exp in cv_experience),
            "relevant_experience": [
                exp for exp in cv_experience
                if self._is_experience_relevant(job_description, exp.get("description", ""))
            ]
        }

    def _is_experience_relevant(self, job_description: str, experience_description: str) -> bool:
        """Check if experience is relevant to job description"""
        embeddings = self.model.encode([job_description, experience_description])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return similarity > 0.6 