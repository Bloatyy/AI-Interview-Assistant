import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import cv2
import numpy as np

# Model paths
ATTIRE_MODEL_PATH = "ml/models/attire.pth"
GROOMING_MODEL_PATH = "ml/models/grooming.pth"

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
            # Attire analysis
            attire_out = self.attire_model(image)
            attire_probs = torch.softmax(attire_out, dim=1)
            attire_score, attire_idx = torch.max(attire_probs, 1)
            results["attire"] = ATTIRE_CLASSES[attire_idx.item()]
            results["attire_confidence"] = attire_score.item()

            # Grooming analysis
            grooming_out = self.grooming_model(image)
            grooming_probs = torch.softmax(grooming_out, dim=1)
            grooming_score, grooming_idx = torch.max(grooming_probs, 1)
            results["grooming"] = GROOMING_CLASSES[grooming_idx.item()]
            results["grooming_confidence"] = grooming_score.item()

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
