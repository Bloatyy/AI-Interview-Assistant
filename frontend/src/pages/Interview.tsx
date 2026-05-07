import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const questions_data = {
  amazon: {
    sde: [
      { id: 1, text: "Tell me about a time you had to deal with a difficult colleague.", type: "behavioral" },
      { id: 2, text: "How would you design a scalable notification system?", type: "technical" },
      { id: 3, text: "Explain the concept of 'Ownership' in Amazon's Leadership Principles.", type: "behavioral" },
    ],
  },
  google: {
    sde: [
      { id: 1, text: "How do you ensure your code is efficient and maintainable?", type: "technical" },
      { id: 2, text: "Describe a complex technical problem you solved recently.", type: "technical" },
    ]
  },
  meta: {
    sde: [
      { id: 1, text: "Why do you want to work at Meta?", type: "intro" },
      { id: 2, text: "How would you approach improving user engagement on a social platform?", type: "technical" },
    ]
  }
};

export default function Interview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const company = searchParams.get("company") || "amazon";
  const role = searchParams.get("role") || "sde";

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const questions = (questions_data as any)[company]?.[role] || questions_data.amazon.sde;

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
      }
    }
    setupCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (isInterviewStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleNext();
    }
    return () => clearInterval(timer);
  }, [isInterviewStarted, timeLeft]);

  const startInterview = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setIsInterviewStarted(true);
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      setIsInterviewStarted(true);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeLeft(60);
    } else {
      navigate("/report");
    }
  };

  return (
    <div className="premium-container page-padding">
      <div className="interview-grid">
        <div className="glass-card interview-main">
          {!isInterviewStarted ? (
            <div style={{ textAlign: 'center', margin: 'auto' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Ready to start?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Ensure you are in a quiet room and your camera is positioned correctly.
              </p>
              <button onClick={startInterview} className="btn-primary" style={{ padding: '1rem 3rem' }}>
                Begin Mock Interview
              </button>
            </div>
          ) : (
            <>
              <div className="interview-header">
                <span className="text-gradient" style={{ fontWeight: 700 }}>Question {currentStep + 1} of {questions.length}</span>
                <div className="timer-box" style={{ color: timeLeft < 10 ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>

              <h2 className="question-text">{questions[currentStep].text}</h2>

              <div className="controls-row">
                <button 
                  onClick={() => setIsRecording(!isRecording)} 
                  className={isRecording ? "btn-secondary" : "btn-primary"}
                  style={{ 
                    background: isRecording ? 'var(--accent-color)' : '',
                    borderColor: isRecording ? 'var(--accent-color)' : '',
                  }}
                >
                  {isRecording ? "Stop Recording" : "Start Answer"}
                </button>
                <button onClick={handleNext} className="btn-secondary">
                  Skip / Next
                </button>
              </div>
            </>
          )}
        </div>

        <div className="sidebar-col">
          <div className="glass-card video-container">
            <video ref={videoRef} autoPlay muted playsInline className="live-video" />
            <div className="live-indicator">
              <div className="indicator-dot"></div>
              Live Tracking
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Observations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="observation-item">
                <span>Face Detected</span>
                <span style={{ color: '#10b981' }}>Yes</span>
              </div>
              <div className="observation-item">
                <span>Eye Gaze</span>
                <span>Centered</span>
              </div>
              <div className="observation-item">
                <span>Posture</span>
                <span>Good</span>
              </div>
            </div>
          </div>

          <div className="glass-card warning-box">
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-color)' }}>Anti-Cheat Warning</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Avoid looking away from the screen or having multiple people in the frame.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
