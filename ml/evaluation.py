import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

FILLER_WORDS = [
    "um", "uh", "uhh", "umm", "like", "you know", "basically", 
    "actually", "literally", "right", "so", "well", "i mean",
    "kind of", "sort of", "stuff", "thing", "whatever", "honestly",
    "i guess", "i think", "maybe"
]

def count_fillers(transcript: str) -> dict:
    """
    Counts filler words in the transcript with per-word breakdown.
    """
    text = transcript.lower()
    total = 0
    breakdown = {}
    for filler in FILLER_WORDS:
        count = text.count(filler)
        if count > 0:
            breakdown[filler] = count
            total += count
    return {"total": total, "breakdown": breakdown}

def evaluate_answer(transcript, question_text, body_language_data=None):
    """
    Evaluates the user's answer using Groq's Llama model.
    Returns confidence, filler words, integrity (body language), and technical scores.
    """
    if not transcript or not question_text:
        return {
            "score": 0,
            "feedback": "No response detected.",
            "strengths": [],
            "weaknesses": ["No answer was provided."],
            "confidence": 0,
            "filler_count": 0,
            "filler_breakdown": {},
            "integrity_score": 0,
            "technical_score": 0
        }

    # Pre-compute filler word analysis from transcript
    filler_analysis = count_fillers(transcript)

    body_lang_context = ""
    integrity_metrics = {"posture": "Unknown", "eye_gaze": "Unknown", "face_detected": "Unknown"}
    if body_language_data:
        integrity_metrics = body_language_data
        body_lang_context = f"""
        === BODY LANGUAGE / INTEGRITY METRICS ===
        - Posture: {body_language_data.get('posture', 'Unknown')}
        - Eye Contact (Gaze): {body_language_data.get('eye_gaze', 'Unknown')}
        - Face Visible: {body_language_data.get('face_detected', 'Unknown')}
        """

    prompt = f"""
    You are a SENIOR AI INTERVIEW EVALUATOR at a top-tier tech company. 
    Analyze this candidate's response with extreme rigor across ALL dimensions.

    === QUESTION ===
    {question_text}

    === CANDIDATE'S VERBATIM RESPONSE ===
    "{transcript}"

    === DETECTED FILLER WORDS ===
    Total: {filler_analysis['total']}
    Breakdown: {json.dumps(filler_analysis['breakdown'])}

    {body_lang_context}

    Evaluate the candidate on these 4 axes:

    1. **CONFIDENCE (0-100)**: 
       - Speech fluency and directness of answers
       - Hesitation patterns (filler words indicate low confidence)
       - Assertiveness of language (uses "I believe" vs "maybe" / "I guess")
       - Penalty: -3 points per filler word detected
       - If many fillers (>5), cap at 50 max

    2. **TECHNICAL SCORE (0-100)**:
       - Depth and accuracy of technical content
       - Use of correct terminology and concepts
       - Logical structure of explanation
       - For behavioral questions, rate communication quality instead

    3. **INTEGRITY SCORE (0-100)**:
       - Based on body language metrics provided above
       - Good posture + Centered gaze + Face visible = high integrity
       - Poor posture / looking away / no face = low integrity
       - If posture is "Good" and eye_gaze is "Centered" and face is "Active": 90-100
       - If any metric is poor/warning: 50-70
       - If face not detected: 20-40

    4. **OVERALL SCORE (0-100)**:
       - Weighted: Technical 40% + Confidence 30% + Integrity 30%

    Return ONLY valid JSON with these exact keys:
    {{
        "score": <overall 0-100>,
        "technical_score": <0-100>,
        "confidence": <0-100>,
        "integrity_score": <0-100>,
        "filler_count": {filler_analysis['total']},
        "feedback": "<2-3 sentence overall assessment>",
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
        "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
        "confidence_analysis": "<1 sentence about their speaking confidence>",
        "technical_analysis": "<1 sentence about their technical depth>",
        "integrity_analysis": "<1 sentence about body language>"
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict, professional interview evaluator. Return ONLY valid JSON. Be honest and precise in scoring. Do NOT inflate scores. A mediocre answer should score 40-60. Only truly excellent answers get 80+.",
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
        
        # Enforce filler count from our own analysis (more reliable than LLM counting)
        evaluation["filler_count"] = filler_analysis["total"]
        evaluation["filler_breakdown"] = filler_analysis["breakdown"]
        
        # Ensure all required keys exist with defaults
        evaluation.setdefault("score", 0)
        evaluation.setdefault("technical_score", 0)
        evaluation.setdefault("confidence", 0)
        evaluation.setdefault("integrity_score", 0)
        evaluation.setdefault("feedback", "Evaluation complete.")
        evaluation.setdefault("strengths", [])
        evaluation.setdefault("weaknesses", [])
        evaluation.setdefault("confidence_analysis", "")
        evaluation.setdefault("technical_analysis", "")
        evaluation.setdefault("integrity_analysis", "")
        
        print(f"  -> Score: {evaluation['score']}, Confidence: {evaluation['confidence']}, Tech: {evaluation['technical_score']}, Integrity: {evaluation['integrity_score']}, Fillers: {evaluation['filler_count']}")
        
        return evaluation
    except Exception as e:
        print(f"Error during evaluation: {e}")
        import traceback
        traceback.print_exc()
        return {
            "score": 0,
            "technical_score": 0,
            "confidence": 0,
            "integrity_score": 0,
            "filler_count": filler_analysis["total"],
            "filler_breakdown": filler_analysis["breakdown"],
            "feedback": f"Evaluation failed: {str(e)}",
            "strengths": [],
            "weaknesses": ["System error during evaluation"],
            "confidence_analysis": "Unable to analyze",
            "technical_analysis": "Unable to analyze",
            "integrity_analysis": "Unable to analyze"
        }
