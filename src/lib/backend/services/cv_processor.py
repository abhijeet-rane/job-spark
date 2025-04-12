import PyPDF2
import docx2txt
import io
from typing import Dict, Any

class CVProcessor:
    @staticmethod
    def extract_text_from_pdf(pdf_content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {str(e)}")
            return ""

    @staticmethod
    def extract_text_from_docx(docx_content: bytes) -> str:
        """Extract text from DOCX content"""
        try:
            text = docx2txt.process(io.BytesIO(docx_content))
            return text
        except Exception as e:
            print(f"Error extracting text from DOCX: {str(e)}")
            return ""

    @staticmethod
    def extract_text(file_content: bytes, file_type: str) -> str:
        """Extract text from uploaded file based on file type"""
        if file_type == "application/pdf":
            return CVProcessor.extract_text_from_pdf(file_content)
        elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            return CVProcessor.extract_text_from_docx(file_content)
        else:
            # For plain text files
            return file_content.decode('utf-8', errors='ignore')

    @staticmethod
    def structure_cv_data(cv_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure CV data into required format"""
        return {
            "raw_text": cv_text,
            "parsed_data": parsed_data,
            "education": parsed_data.get("education", []),
            "experience": parsed_data.get("work_experience", []),
            "skills": parsed_data.get("skills", []),
            "certifications": parsed_data.get("certifications", [])
        } 