import urllib.request
import os

def download_dnn_models():
    models = {
        "deploy.prototxt": "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
        "res10_300x300_ssd_iter_140000.caffemodel": "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
    }
    
    for name, url in models.items():
        path = os.path.join("ml", name)
        print(f"Downloading {name} from {url}...")
        urllib.request.urlretrieve(url, path)
        print(f"Downloaded {name}, size: {os.path.getsize(path)} bytes")

if __name__ == "__main__":
    download_dnn_models()
