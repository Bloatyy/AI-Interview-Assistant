import requests
import os

url = "http://localhost:8000/process-answer"
# Create a dummy small wav file if not exists
with open("test_audio.wav", "wb") as f:
    f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")

files = {'audio': ('test_audio.wav', open('test_audio.wav', 'rb'), 'audio/wav')}
data = {'question_text': 'Explain the concept of Ownership in Amazon Leadership Principles.'}

try:
    print("Sending request to /process-answer...")
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
finally:
    if os.path.exists("test_audio.wav"):
        os.remove("test_audio.wav")
