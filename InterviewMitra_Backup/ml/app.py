from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import time

app = Flask(__name__)
CORS(app) # Enable CORS for frontend integration

# Simulated Dataset
QUESTIONS_DATA = {
    "amazon": {
        "sde": [
            {"id": 1, "text": "Tell me about a time you had to deal with a difficult colleague.", "type": "behavioral"},
            {"id": 2, "text": "How would you design a scalable notification system?", "type": "technical"},
            {"id": 3, "text": "Explain the concept of 'Ownership' in Amazon's Leadership Principles.", "type": "behavioral"},
        ]
    },
    "google": {
        "sde": [
            {"id": 1, "text": "How do you ensure your code is efficient and maintainable?", "type": "technical"},
            {"id": 2, "text": "Describe a complex technical problem you solved recently.", "type": "technical"},
        ]
    }
}

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    data = request.json
    company = data.get('company', 'amazon')
    role = data.get('role', 'sde')
    
    questions = QUESTIONS_DATA.get(company, {}).get(role, QUESTIONS_DATA['amazon']['sde'])
    interview_id = str(uuid.uuid4())
    
    return jsonify({
        "status": "success",
        "interview_id": interview_id,
        "questions": questions
    })

@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    # In a real app, you'd handle audio files and camera data here
    # data = request.form
    # audio_file = request.files.get('audio')
    
    return jsonify({
        "status": "success",
        "score": 85,
        "feedback": "Strong communication, but try to be more specific with technical examples.",
        "transcript": "Simulated transcript of the user's answer..."
    })

@app.route('/api/end-interview', methods=['POST'])
def end_interview():
    data = request.json
    interview_id = data.get('interview_id')
    
    # Logic to aggregate scores and generate report
    return jsonify({
        "status": "success",
        "report": {
            "overall_score": 82,
            "strengths": ["Leadership focus", "Clear communication"],
            "weaknesses": ["Minor technical gaps"],
            "suggestion": "Review system design patterns."
        }
    })

if __name__ == '__main__':
    print("Flask Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
