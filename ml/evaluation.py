import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def evaluate_answer(transcript, question_text):
    """
    Evaluates the user's answer using Groq's Llama model.
    """
    if not transcript or not question_text:
        return {"error": "Missing transcript or question text"}

    prompt = f"""
    You are an AI Interviewer. Evaluate the following candidate's answer based on the question provided.
    
    Question: {question_text}
    Candidate's Answer: {transcript}
    
    Provide a score out of 100, and short feedback focusing on strengths and weaknesses.
    Also, estimate the candidate's confidence level (0-100) and count the number of filler words (um, uh, like, etc.).
    Return the response in JSON format with the following keys:
    - score: integer
    - feedback: string
    - strengths: list of strings
    - weaknesses: list of strings
    - confidence: integer
    - filler_count: integer
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that evaluates interview answers and returns JSON.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        
        import json
        evaluation = json.loads(chat_completion.choices[0].message.content)
        return evaluation
    except Exception as e:
        print(f"Error during evaluation: {e}")
        return {
            "score": 0,
            "feedback": f"Evaluation failed: {str(e)}",
            "strengths": [],
            "weaknesses": []
        }
