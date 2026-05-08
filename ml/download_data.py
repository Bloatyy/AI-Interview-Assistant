import kagglehub
import os
import shutil

def download_datasets():
    print("--- Downloading Appearance Datasets via kagglehub ---")
    
    # 1. Attire Dataset (Formal vs Casual)
    print("Downloading Attire dataset...")
    try:
        attire_path = kagglehub.dataset_download("mohamedmoslemani/mens-fashion-formal-vs-casual")
        print(f"Attire dataset downloaded to: {attire_path}")
    except Exception as e:
        print(f"Failed to download attire dataset: {e}")
        attire_path = None
    
    # 2. Grooming Dataset (Beard vs No Beard)
    print("Downloading Grooming dataset...")
    try:
        grooming_path = kagglehub.dataset_download("uzair01/beard-or-no-beard")
        print(f"Grooming dataset downloaded to: {grooming_path}")
    except Exception as e:
        print(f"Failed to download grooming dataset: {e}")
        grooming_path = None
    
    # Prepare local data directory
    base_dir = "ml/data/looks"
    os.makedirs(base_dir, exist_ok=True)
    
    def setup_data(src, name):
        if not src: return
        dest = os.path.join(base_dir, name)
        if os.path.exists(dest):
            shutil.rmtree(dest)
        shutil.copytree(src, dest)
        print(f"Data synced to {dest}")

    if attire_path:
        setup_data(attire_path, "attire")
    if grooming_path:
        setup_data(grooming_path, "grooming")

if __name__ == "__main__":
    download_datasets()
