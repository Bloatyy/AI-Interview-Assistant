import kagglehub
import os

def download_datasets():
    datasets = {
        "fer2013": "msambare/fer2013",
        "ravdess": "uwrfkaggler/ravdess-emotional-speech-audio",
        "crema-d": "ejlok1/cremad"
    }
    
    data_dir = "ml/data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        
    for name, path in datasets.items():
        print(f"Downloading {name}...")
        download_path = kagglehub.dataset_download(path)
        print(f"Downloaded {name} to: {download_path}")
        
        # Link or move to ml/data if needed, or just use the download_path
        # For simplicity, we'll just print the paths for now.

if __name__ == "__main__":
    download_datasets()
