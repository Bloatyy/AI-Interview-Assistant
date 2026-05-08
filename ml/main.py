from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import numpy as np
import cv2
from transcription import transcribe_audio
from evaluation import evaluate_answer
from anti_cheat import detect_cheating
from cv_analyzer import analyze_cv
from technical_evaluator import evaluate_thought_process

app = FastAPI(title="InterviewMitra ML Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-answer")
async def process_answer(
    audio: UploadFile = File(...), 
    question_text: str = Form(...),
    posture: str = Form("Unknown"),
    eye_gaze: str = Form("Unknown"),
    face_detected: str = Form("Unknown")
):
    """
    Unified endpoint for transcription and evaluation.
    Receives audio + body language metadata, transcribes via Groq Whisper,
    then evaluates via Groq Llama with full context.
    """
    import uuid
    unique_id = uuid.uuid4().hex
    temp_file = f"temp_{unique_id}_{audio.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
        body_language_data = {
            "posture": posture,
            "eye_gaze": eye_gaze,
            "face_detected": face_detected
        }

        # 1. Transcribe (Using high-speed Groq Whisper API)
        print(f"DEBUG: Starting transcription for {temp_file}...")
        transcript = transcribe_audio(temp_file)
        print(f"DEBUG: Transcription complete: {transcript[:80]}...")
        
        # 2. Evaluate (Using high-speed Groq Llama-3.1)
        print("DEBUG: Starting AI evaluation...")
        evaluation = evaluate_answer(transcript, question_text, body_language_data)
        print(f"DEBUG: Evaluation complete. Score: {evaluation.get('score', 'N/A')}")
        
        return {
            "transcript": transcript,
            "evaluation": evaluation
        }
    except Exception as e:
        print(f"Error in process_answer: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/anti-cheat")
async def anti_cheat(file: UploadFile = File(...)):
    # Read and decode the image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"error": "Invalid image", "is_cheating": False}
        
    analysis = detect_cheating(frame)
    return analysis

@app.post("/analyze-cv")
async def analyze_cv_endpoint(file: UploadFile = File(...)):
    import uuid
    unique_id = uuid.uuid4().hex
    temp_file = f"temp_cv_{unique_id}_{file.filename}"
    
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        analysis = analyze_cv(temp_file)
        return analysis
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/evaluate-thought-process")
async def evaluate_thought_process_endpoint(data: dict):
    question = data.get("question")
    thought_process = data.get("thought_process")
    
    if not question or not thought_process:
        return {"error": "Missing question or thought process"}
        
    try:
        evaluation = evaluate_thought_process(question, thought_process)
        return evaluation
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
