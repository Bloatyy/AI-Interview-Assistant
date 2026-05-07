import urllib.request
import os

def download_models():
    models = {
        "face_landmarker.task": "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    }
    
    for name, url in models.items():
        path = os.path.join("ml", name)
        if not os.path.exists(path):
            print(f"Downloading {name}...")
            urllib.request.urlretrieve(url, path)
            print(f"Downloaded {name}")
        else:
            print(f"{name} already exists.")

if __name__ == "__main__":
    download_models()
