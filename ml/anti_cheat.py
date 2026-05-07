import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Get the absolute path to the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Model Paths
PROTOTXT = os.path.join(BASE_DIR, "deploy.prototxt")
MODEL = os.path.join(BASE_DIR, "res10_300x300_ssd_iter_140000.caffemodel")
FACE_LANDMARKER_PATH = os.path.join(BASE_DIR, "face_landmarker.task")

# Initialize OpenCV SSD (Keep it for robust face count)
net = None
try:
    if os.path.exists(PROTOTXT) and os.path.exists(MODEL):
        net = cv2.dnn.readNetFromCaffe(PROTOTXT, MODEL)
except Exception as e:
    print(f"Error loading SSD model: {e}")

# Initialize MediaPipe Face Landmarker (Tasks API)
landmarker = None
try:
    if os.path.exists(FACE_LANDMARKER_PATH):
        base_options = python.BaseOptions(model_asset_path=FACE_LANDMARKER_PATH)
        # Using faster options: num_faces=1
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False, # Disable blendshapes for speed
            output_facial_transformation_matrixes=False, # Disable matrixes for speed
            num_faces=1)
        landmarker = vision.FaceLandmarker.create_from_options(options)
except Exception as e:
    print(f"Error loading Face Landmarker: {e}")

def get_eye_gaze_optimized(landmarks):
    """
    Calculates eye gaze direction using iris landmarks.
    """
    try:
        # Indices for Iris: 468 (L), 473 (R)
        # Indices for Corners: 33, 133 (L) | 362, 263 (R)
        l_iris = landmarks[468]
        l_outer = landmarks[33]
        l_inner = landmarks[133]
        
        r_iris = landmarks[473]
        r_inner = landmarks[362]
        r_outer = landmarks[263]
        
        l_ratio = (l_iris.x - l_outer.x) / (l_inner.x - l_outer.x) if (l_inner.x - l_outer.x) != 0 else 0.5
        r_ratio = (r_iris.x - r_inner.x) / (r_outer.x - r_inner.x) if (r_outer.x - r_inner.x) != 0 else 0.5
        
        avg_ratio = (l_ratio + r_ratio) / 2
        
        if 0.42 <= avg_ratio <= 0.58:
            return "Centered"
        elif avg_ratio < 0.42:
            return "Looking Right"
        else:
            return "Looking Left"
    except:
        return "Centered"

def analyze_posture(landmarks):
    """
    Analyzes body posture using face landmarks (Head Tilt and Position).
    """
    try:
        # Nose bridge: 1, Chin: 152
        # Left eye: 33, Right eye: 263
        nose = landmarks[1]
        chin = landmarks[152]
        l_eye = landmarks[33]
        r_eye = landmarks[263]
        
        # 1. Detect Head Tilt (Roll)
        eye_dy = r_eye.y - l_eye.y
        eye_dx = r_eye.x - l_eye.x
        tilt_angle = np.degrees(np.arctan2(eye_dy, eye_dx))
        
        # 2. Detect Slumping (Y-position of face center)
        face_center_y = (nose.y + chin.y) / 2
        
        status = "Good"
        msg = None
        
        if abs(tilt_angle) > 15:
            status = "Poor (Tilted)"
            msg = "Keep your head straight."
        elif face_center_y > 0.7:
            status = "Poor (Slumping)"
            msg = "Sit up straight! You are too low in the frame."
        
        return status, msg
    except:
        return "Good", None

def detect_cheating(frame):
    """
    Detects potential cheating with optimized eye tracking and posture analysis.
    """
    if frame is None:
        return {"error": "Invalid input frame", "is_cheating": False}
    
    (h, w) = frame.shape[:2]
    
    # 1. Face Detection (SSD) - Fast
    face_count = 0
    if net is not None:
        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0,
                                     (300, 300), (104.0, 117.0, 123.0))
        net.setInput(blob)
        detections = net.forward()
        for i in range(0, detections.shape[2]):
            if detections[0, 0, i, 2] > 0.5:
                face_count += 1

    # 2. Optimized Eye & Posture Tracking (MediaPipe Tasks)
    eye_gaze = "Not Detected"
    posture_status = "Unknown"
    posture_msg = None
    
    if landmarker is not None:
        # Optimize: Resize frame for MediaPipe to speed up processing
        # 256x256 is enough for landmarks
        small_frame = cv2.resize(frame, (256, 256))
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB))
        result = landmarker.detect(mp_image)
        
        if result.face_landmarks:
            eye_gaze = get_eye_gaze_optimized(result.face_landmarks[0])
            posture_status, posture_msg = analyze_posture(result.face_landmarks[0])

    # 3. Decision Logic
    is_cheating = False
    alert = None
    
    if face_count == 0:
        is_cheating = True
        alert = "No face detected! Please stay in view."
    elif face_count > 1:
        is_cheating = True
        alert = f"Multiple faces ({face_count}) detected!"
    elif posture_msg:
        alert = f"Posture: {posture_msg}"
    elif eye_gaze != "Centered" and eye_gaze != "Not Detected":
        alert = f"Gaze: {eye_gaze}"

    status_label = "Yes" if face_count == 1 else ("Multiple" if face_count > 1 else "No face detected")

    return {
        "faces_detected": face_count,
        "face_label": status_label,
        "is_cheating": is_cheating,
        "alert": alert,
        "posture_status": posture_status,
        "eye_gaze": eye_gaze,
        "overall_score": 100 if (face_count == 1 and eye_gaze == "Centered" and posture_status == "Good") else 75,
        "status": "warning" if (is_cheating or alert) else "ok"
    }
