from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
import os
import shutil
import numpy as np
import cv2

# Import local modules
from .transcription import transcribe_audio
from .evaluation import evaluate_answer
from .anti_cheat import detect_cheating

load_dotenv() # Load Groq API Key from .env

app = FastAPI(title="InterviewMitra ML Backend")

@app.post("/api/start-interview")
async def start_interview():
    return {"status": "success"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    temp_file = f"temp_{audio.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    transcript = transcribe_audio(temp_file)
    if os.path.exists(temp_file):
        os.remove(temp_file)
    return {"transcript": transcript}

@app.post("/evaluate")
async def evaluate(data: dict):
    transcript = data.get("transcript", "")
    question_text = data.get("question_text", "")
    evaluation = evaluate_answer(transcript, question_text)
    return evaluation

@app.post("/anti-cheat")
async def anti_cheat(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"error": "Invalid image"}
        
    analysis = detect_cheating(frame)
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
