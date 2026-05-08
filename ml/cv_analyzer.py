import os
import pypdf
import docx2txt
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        text = ""
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text()
        return text
    elif ext == '.docx':
        return docx2txt.process(file_path)
    else:
        return None

def analyze_cv(file_path):
    print(f"DEBUG: Analyzing CV: {file_path}")
    text = extract_text_from_file(file_path)
    if not text:
        print("DEBUG: Text extraction failed.")
        return {"error": "Failed to extract text from CV"}

    print(f"DEBUG: Text extracted ({len(text)} chars). Sending to Groq...")
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following CV text.
    Provide an ATS Score (0-100) and exactly 4 lines of improvements that can be made to make it more ATS-friendly and professional.
    
    CV Text:
    {text[:4000]}
    
    Return the response in JSON format with exactly these keys:
    - score: integer
    - improvements: list of strings (exactly 4 items)
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional ATS analyzer that returns JSON.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content
        print(f"DEBUG: Groq response received: {content[:100]}...")
        import json
        analysis = json.loads(content)
        return analysis
    except Exception as e:
        print(f"DEBUG: Error during CV analysis: {e}")
        return {
            "score": 0,
            "improvements": ["Analysis failed. Please try again."]
        }
