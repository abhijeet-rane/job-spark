import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings

async def send_email(
    recipient_email: str,
    subject: str,
    body: str,
    is_html: bool = False
) -> bool:
    """
    Send an email using the configured SMTP settings.
    
    Args:
        recipient_email: The email address of the recipient
        subject: The subject of the email
        body: The body content of the email
        is_html: Whether the body content is HTML (default: False)
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    # Check if SMTP settings are configured
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP settings not configured. Email not sent.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        # Attach body
        content_type = 'html' if is_html else 'plain'
        msg.attach(MIMEText(body, content_type))
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()  # Enable TLS
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

async def send_interview_invitation(
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    interview_time: str,
    interview_type: str,
    email_content: str
) -> bool:
    """
    Send an interview invitation email to a candidate.
    
    Args:
        candidate_email: The email address of the candidate
        candidate_name: The name of the candidate
        job_title: The title of the job
        company_name: The name of the company
        interview_time: The scheduled interview time
        interview_type: The type of interview (e.g., "video", "in-person")
        email_content: The pre-generated email content
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    subject = f"Interview Invitation: {job_title} at {company_name}"
    
    # If email_content is not provided, generate a default one
    if not email_content:
        email_content = f"""
        <html>
        <body>
            <p>Dear {candidate_name},</p>
            <p>We are pleased to invite you for an interview for the position of <strong>{job_title}</strong> at <strong>{company_name}</strong>.</p>
            <p><strong>Interview Details:</strong></p>
            <ul>
                <li><strong>Date and Time:</strong> {interview_time}</li>
                <li><strong>Type:</strong> {interview_type}</li>
            </ul>
            <p>Please confirm your attendance by replying to this email.</p>
            <p>Best regards,<br>{company_name} Hiring Team</p>
        </body>
        </html>
        """
    
    return await send_email(
        recipient_email=candidate_email,
        subject=subject,
        body=email_content,
        is_html=True
    ) 