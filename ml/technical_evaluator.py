import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def evaluate_thought_process(question, thought_process):
    """
    Evaluates a candidate's thought process for a technical question using Groq.
    Returns score, confidence, technical_score, integrity_score, and detailed feedback.
    """
    if not question or not thought_process:
        return {
            "score": 0,
            "status": "Far",
            "feedback": "No thought process provided.",
            "strengths": ["N/A"],
            "weaknesses": ["No logic was submitted."],
            "confidence": 30,
            "technical_score": 0,
            "integrity_score": 85,
            "filler_count": 0
        }

    # Detect filler words in written responses too (less common but possible)
    filler_words = ["like", "basically", "um", "uh", "i guess", "kind of", "sort of", "maybe", "stuff"]
    text_lower = thought_process.lower()
    filler_count = sum(text_lower.count(f) for f in filler_words)

    prompt = f"""
    You are an expert Technical Interviewer at a FAANG company. 
    Evaluate the candidate's written thought process for this coding problem.

    === PROBLEM ===
    {question}

    === CANDIDATE'S THOUGHT PROCESS ===
    {thought_process}

    Evaluate rigorously:

    1. **TECHNICAL SCORE (0-100)**: How correct, efficient, and complete is their approach?
       - Perfect: Correct algorithm + optimal time/space complexity + edge cases considered
       - Close: Correct idea but missing optimizations or edge cases
       - Far: Wrong approach or fundamental misunderstanding

    2. **CONFIDENCE (0-100)**: How assertive and structured is their thinking?
       - High: Clear, structured steps with decisive language
       - Low: Uncertain language, vague steps, "maybe" / "I think"

    3. **OVERALL SCORE (0-100)**: Weighted average (Technical 70% + Confidence 30%)

    4. **STATUS**: "Perfect" (80-100), "Close" (50-79), or "Far" (0-49)

    Return ONLY valid JSON:
    {{
        "score": <overall 0-100>,
        "technical_score": <0-100>,
        "confidence": <0-100>,
        "status": "<Perfect|Close|Far>",
        "feedback": "<2-sentence assessment>",
        "strengths": ["<strength 1>", "<strength 2>"],
        "weaknesses": ["<weakness 1>", "<weakness 2>"],
        "technical_analysis": "<1 sentence about their technical approach>",
        "confidence_analysis": "<1 sentence about their clarity/confidence>"
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict technical interviewer. Return ONLY valid JSON. Score honestly — a brute force solution is 40-60, an optimal solution with clear reasoning is 80+.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        evaluation = json.loads(chat_completion.choices[0].message.content)
        
        # Inject filler count and integrity (technical sessions always have high integrity)
        evaluation["filler_count"] = filler_count
        evaluation["integrity_score"] = 85  # Written responses default to good integrity
        
        # Ensure all keys exist
        evaluation.setdefault("score", 0)
        evaluation.setdefault("technical_score", 0)
        evaluation.setdefault("confidence", 50)
        evaluation.setdefault("status", "Far")
        evaluation.setdefault("feedback", "Evaluation complete.")
        evaluation.setdefault("strengths", [])
        evaluation.setdefault("weaknesses", [])
        
        print(f"  -> Tech Score: {evaluation['technical_score']}, Confidence: {evaluation['confidence']}, Status: {evaluation['status']}")
        
        return evaluation
    except Exception as e:
        print(f"Error during thought process evaluation: {e}")
        import traceback
        traceback.print_exc()
        return {
            "score": 0,
            "technical_score": 0,
            "confidence": 0,
            "integrity_score": 85,
            "filler_count": filler_count,
            "status": "Far",
            "feedback": f"Evaluation failed: {str(e)}",
            "strengths": ["System Error"],
            "weaknesses": ["Inference Failure"]
        }
