import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import cv2
import numpy as np

# Model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ATTIRE_MODEL_PATH = os.path.join(BASE_DIR, "models", "attire.pth")
GROOMING_MODEL_PATH = os.path.join(BASE_DIR, "models", "grooming.pth")

# Classes (Must match ImageFolder alphabetical order: Beard/No Beard, formal/informal)
ATTIRE_CLASSES = ["formal", "informal"]
GROOMING_CLASSES = ["Beard", "No Beard"]

class LookAnalyzer:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # Load Attire Model
        self.attire_model = self._load_model(ATTIRE_MODEL_PATH)
        # Load Grooming Model
        self.grooming_model = self._load_model(GROOMING_MODEL_PATH)

    def _load_model(self, path):
        model = models.mobilenet_v2(pretrained=False)
        num_ftrs = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_ftrs, 2)
        
        if os.path.exists(path):
            try:
                model.load_state_dict(torch.load(path, map_location=self.device))
                print(f"Loaded model from {path}")
            except Exception as e:
                print(f"Error loading model {path}: {e}")
        else:
            print(f"Model {path} not found. Using untrained weights.")
        
        model = model.to(self.device)
        model.eval()
        return model

    def analyze_frame(self, frame):
        """
        Analyzes a single OpenCV frame for attire and grooming.
        Returns labels and confidence scores.
        """
        # Convert OpenCV BGR to PIL RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(image)
        image = self.transform(image).unsqueeze(0).to(self.device)

        results = {}

        with torch.no_grad():
            # Attire analysis with strict confidence threshold
            attire_out = self.attire_model(image)
            attire_probs = torch.softmax(attire_out, dim=1)
            attire_score, attire_idx = torch.max(attire_probs, 1)
            
            raw_attire = ATTIRE_CLASSES[attire_idx.item()]
            conf = attire_score.item()
            
            # STRICT RULE: Must be > 80% confident to be called "formal"
            if raw_attire == "formal" and conf < 0.8:
                results["attire"] = "informal"
            else:
                results["attire"] = raw_attire
                
            results["attire_confidence"] = conf
            print(f"DEBUG: Attire Check -> Raw: {raw_attire}, Conf: {conf:.2f}, Final: {results['attire']}")

            # Grooming analysis
            grooming_out = self.grooming_model(image)
            grooming_probs = torch.softmax(grooming_out, dim=1)
            grooming_score, grooming_idx = torch.max(grooming_probs, 1)
            
            raw_grooming = GROOMING_CLASSES[grooming_idx.item()]
            g_conf = grooming_score.item()
            
            if raw_grooming == "No Beard" and g_conf < 0.8:
                results["grooming"] = "Beard" # Assume facial hair if uncertain
            else:
                results["grooming"] = raw_grooming
                
            results["grooming_confidence"] = g_conf
            print(f"DEBUG: Grooming Check -> Raw: {raw_grooming}, Conf: {g_conf:.2f}, Final: {results['grooming']}")

        # Grade the looks (Professionalism Score)
        # formal = +60, informal = +20
        # No Beard = +40, Beard = +30
        
        base_score = 0
        if results["attire"] == "formal":
            base_score += 60
        else:
            base_score += 20
            
        if results["grooming"] == "No Beard":
            base_score += 40
        else:
            base_score += 30 # Beard is also professional if groomed
            
        results["looks_grade"] = base_score
        
        return results

# Singleton instance
analyzer = LookAnalyzer()

def analyze_looks(frame):
    return analyzer.analyze_frame(frame)
