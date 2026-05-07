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

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    temp_file = f"temp_{audio.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
        transcript = transcribe_audio(temp_file)
        return {"transcript": transcript}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/evaluate")
async def evaluate(data: dict):
    transcript = data.get("transcript", "")
    question_text = data.get("question_text", "")
    evaluation = evaluate_answer(transcript, question_text)
    return evaluation

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
