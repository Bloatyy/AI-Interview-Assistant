from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import numpy as np
import cv2
from transcription import transcribe_audio
from evaluation import evaluate_answer
from anti_cheat import detect_cheating

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
async def process_answer(audio: UploadFile = File(...), question_text: str = Form(...)):
    """
    Unified endpoint for transcription and evaluation.
    Significantly faster by reducing network round-trips.
    """
    import uuid
    unique_id = uuid.uuid4().hex
    temp_file = f"temp_{unique_id}_{audio.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
        # 1. Transcribe (Using high-speed Groq API)
        print(f"DEBUG: Starting transcription for {temp_file}...")
        transcript = transcribe_audio(temp_file)
        print(f"DEBUG: Transcription complete: {transcript[:50]}...")
        
        # 2. Evaluate (Using high-speed Groq Llama-3.1)
        print("DEBUG: Starting AI evaluation...")
        evaluation = evaluate_answer(transcript, question_text)
        print("DEBUG: Evaluation complete.")
        
        return {
            "transcript": transcript,
            "evaluation": evaluation
        }
    except Exception as e:
        print(f"Error in process_answer: {e}")
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

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
