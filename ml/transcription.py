import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(audio_path):
    """
    Transcribes the audio file using Groq's high-speed Whisper API.
    This is significantly faster than running Whisper locally.
    """
    if not os.path.exists(audio_path):
        return "Audio file not found."
    
    try:
        print(f"DEBUG: Sending {audio_path} to Groq Whisper API...")
        
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_path), file.read()),
                model="whisper-large-v3", # Use current supported model
                response_format="json",
                language="en"
            )
            
        print("DEBUG: Groq Transcription successful.")
        return transcription.text
        
    except Exception as e:
        print(f"Error during Groq transcription: {e}")
        # Fallback if API fails (optional: could add a simple local fallback here)
        return f"Transcription failed: {str(e)}"
