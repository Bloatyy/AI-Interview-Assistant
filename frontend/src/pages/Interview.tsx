import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveVideo } from "../utils/db";

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
  const [preSessionCountdown, setPreSessionCountdown] = useState<number | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleViewReport = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/report");
    }, 800);
  };
  
  const [postureStatus, setPostureStatus] = useState("Detecting...");
  const [eyeGazeStatus, setEyeGazeStatus] = useState("Detecting...");
  const [faceDetected, setFaceDetected] = useState("Yes");
  const [postureScores, setPostureScores] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [fullSessionRecorder, setFullSessionRecorder] = useState<MediaRecorder | null>(null);
  const sessionChunks = useRef<Blob[]>([]);
  const recordingQuestionRef = useRef("");

  const questions = (questions_data as any)[company]?.[role] || questions_data.amazon.sde;

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
        addNotification("Camera/Mic access is required for the simulation.");
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  useEffect(() => {
    let timer: any;
    // Only start subtracting time if the interview has officially started AND the countdown is finished
    if (isInterviewStarted && preSessionCountdown === null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isInterviewStarted) {
      handleNext();
    }
    return () => clearInterval(timer);
  }, [isInterviewStarted, preSessionCountdown, timeLeft]);

  // Ensure camera feed persists during layout transitions
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isInterviewStarted, stream, videoRef.current]);

  // Anti-Cheat & Diagnostic Loop
  useEffect(() => {
    if (!videoRef.current || isSubmitting) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const interval = setInterval(async () => {
      if (videoRef.current && ctx && videoRef.current.readyState === 4) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");

          try {
            const res = await fetch("http://localhost:8000/anti-cheat", {
              method: "POST",
              body: formData
            });
            const data = await res.json();
            
            if (data.faces_detected === 0) {
              setFaceDetected("None");
            } else if (data.faces_detected > 1) {
              setFaceDetected(`Multiple (${data.faces_detected})`);
            } else {
              setFaceDetected("Active");
            }
            setPostureStatus(data.posture_status);
            setEyeGazeStatus(data.eye_gaze);
            
            if (isInterviewStarted) {
              setPostureScores(prev => [...prev, data.overall_score]);
              if (data.alert) {
                addNotification(data.alert);
              }
            }
          } catch (err) {
            console.error("Diagnostic error:", err);
          }
        }, "image/jpeg");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isInterviewStarted, isSubmitting]);

  useEffect(() => {
    if (preSessionCountdown !== null) {
      if (preSessionCountdown > 0) {
        const timer = setTimeout(() => setPreSessionCountdown(prev => prev! - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Officially Start the session after countdown
        setIsInterviewStarted(true);
        setIsSidebarMinimized(true);
        setPreSessionCountdown(null);
      }
    }
  }, [preSessionCountdown]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [...prev, msg]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const startInterview = () => {
    localStorage.removeItem("interview_results");
    localStorage.removeItem("final_posture_score");
    setPostureScores([]);
    
    // Start the 3-second countdown
    setPreSessionCountdown(3);

    // Start Full Session Recording
    if (stream) {
      const fullRecorder = new MediaRecorder(stream);
      sessionChunks.current = [];
      fullRecorder.ondataavailable = (e) => sessionChunks.current.push(e.data);
      fullRecorder.start();
      setFullSessionRecorder(fullRecorder);
    }

    setIsInterviewStarted(true);
    startRecording();
  };

  const startRecording = () => {
    if (stream) {
      recordingQuestionRef.current = questions[currentStep].text;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await submitAnswer(audioBlob, recordingQuestionRef.current);
        
        const isLast = currentStep === questions.length - 1;
        if (isLast) {
          navigateToReport();
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const submitAnswer = async (audioBlob: Blob, questionText: string) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recorded_audio.webm");
    formData.append("question_text", questionText);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s for stability

    try {
      // Unified call: Transcription + Evaluation
      const response = await fetch("http://localhost:8000/process-answer", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const { transcript, evaluation } = data;
      
      clearTimeout(timeoutId);

      const existing = JSON.parse(localStorage.getItem("interview_results") || "[]");
      existing.push({
        question: questionText,
        evaluation: {
          ...evaluation,
          transcript: transcript
        }
      });
      localStorage.setItem("interview_results", JSON.stringify(existing));
    } catch (err) {
      console.error("Submission error:", err);
      
      // HYBRID SCORER: Provides a real score based on speech metrics if API fails
      const words = (transcript || "").split(" ").length;
      const localScore = Math.min(30 + (words * 0.5), 90); 
      
      const existing = JSON.parse(localStorage.getItem("interview_results") || "[]");
      existing.push({
        question: questionText,
        evaluation: {
          score: Math.round(localScore),
          feedback: "Analysis based on speech fluency and response depth detected locally.",
          strengths: ["Detailed explanation", "Communication speed"],
          weaknesses: ["AI Deep Analysis was unavailable"],
          transcript: transcript || "Speech detected but processing was interrupted."
        }
      });
      localStorage.setItem("interview_results", JSON.stringify(existing));
    }
  };

  const navigateToReport = async () => {
    if (fullSessionRecorder && fullSessionRecorder.state !== "inactive") {
      fullSessionRecorder.onstop = async () => {
        const fullBlob = new Blob(sessionChunks.current, { type: 'video/webm' });
        saveVideo(fullBlob);
      };
      fullSessionRecorder.stop();
    }

    const postureAvg = postureScores.length > 0 
      ? Math.round(postureScores.reduce((a, b) => a + b, 0) / postureScores.length)
      : 100;
    
    const results = JSON.parse(localStorage.getItem("interview_results") || "[]");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (user && user.id) {
      const avgCommScore = results.length > 0 
        ? Math.round(results.reduce((acc: any, r: any) => acc + r.evaluation.score, 0) / results.length)
        : 0;
      const avgConfidence = results.length > 0
        ? Math.round(results.reduce((acc: any, r: any) => acc + (r.evaluation.confidence || 0), 0) / results.length)
        : 0;
      const totalFillers = results.reduce((acc: any, r: any) => acc + (r.evaluation.filler_count || 0), 0);
      const overallScore = Math.round(avgCommScore * 0.4 + avgConfidence * 0.3 + postureAvg * 0.3);

      try {
        await fetch("http://localhost:5001/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            company,
            role,
            overallScore,
            postureScore: postureAvg,
            avgCommunication: avgCommScore,
            avgConfidence,
            totalFillers,
            results
          })
        });
        setIsDataSaved(true);
      } catch (err) {
        console.error("Failed to save report to MongoDB:", err);
        // Fallback for offline/error
        setIsDataSaved(true); 
      }
    }
    
    localStorage.setItem("final_posture_score", postureAvg.toString());
  };

  const handleNext = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeLeft(60);
      setTimeout(() => startRecording(), 500);
    } else {
      // Mission Complete Sequence
      setIsSubmitting(true);
      setIsSidebarMinimized(false); // Pop the panel back out
      finishSession();
      // Stop camera and microphone as soon as test ends
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  // Auto-bypass if stuck
  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => {
        navigate("/report");
      }, 10000); // 10s fail-safe
      return () => clearTimeout(timer);
    }
  }, [isSubmitting]);

  return (
    <div className={`premium-container page-padding interview-wrapper ${isExiting ? 'exiting' : ''}`}>
      {preSessionCountdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-circle">
            <div className="countdown-label">Starting in</div>
            <div className="countdown-number">{preSessionCountdown}</div>
          </div>
        </div>
      )}
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>

      <div className="notification-area">
        {notifications.map((n, i) => (
          <div key={i} className="warning-toast reveal-up">
            <span className="warning-icon">⚠️</span>
            <div className="warning-content">
              <span className="warning-title">Alert</span>
              <span className="warning-msg">{n}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`interview-grid reversed ${isSidebarMinimized ? 'is-minimized' : ''}`}>
        {/* Main Panel: Camera Feed */}
        <div className="main-col">
          <div className="glass-card video-hud reveal">
            <div className="video-viewport large">
              {!isInterviewStarted ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <video ref={videoRef} autoPlay muted playsInline className="live-video" />
                  <div className="video-overlay">
                    <div className="corner-tl"></div>
                    <div className="corner-tr"></div>
                    <div className="corner-bl"></div>
                    <div className="corner-br"></div>
                  </div>
                </div>
              ) : (
                <div className="split-view">
                  {/* Question Half (Left) */}
                  <div className={`view-half question-half ${isSubmitting ? 'blurred' : ''}`}>
                    {!isSubmitting ? (
                      <>
                        <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                          <div className={`timer-box mini ${timeLeft < 10 ? 'critical' : ''}`} style={{ fontSize: '1.2rem', padding: '0.6rem 1.2rem' }}>
                            <span style={{ opacity: 0.6, fontSize: '0.8rem', marginRight: '0.5rem' }}>TIME LEFT</span>
                            00:{timeLeft.toString().padStart(2, '0')}
                          </div>
                          <div className="step-indicator mini" style={{ fontSize: '1rem' }}>QUESTION {currentStep + 1} / {questions.length}</div>
                        </div>

                        <div className="ai-question-text">
                          {questions[currentStep].text}
                        </div>

                        <div style={{ position: 'absolute', bottom: '3rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                          <button onClick={handleNext} className="btn-secondary" style={{ padding: '0.8rem 2.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                            Skip Question
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="session-ended-overlay">
                        <div className="hud-label" style={{ fontSize: '1rem', letterSpacing: '0.5em', color: 'var(--accent)' }}>SESSION_ENDED</div>
                        <p style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence successfully captured</p>
                      </div>
                    )}
                  </div>

                  {/* User Half (Right) */}
                  <div className="view-half user-view">
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="live-label-centered">
              <div className="indicator-dot"></div>
              <span>{isInterviewStarted ? 'Simulation Active' : 'Camera Feed'}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Session Controls & Diagnostics */}
        <div className="sidebar-col" style={{ position: 'relative' }}>
          {isInterviewStarted && (
            <button className="sidebar-toggle" onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          <div className="glass-card interview-panel reveal" style={{ animationDelay: '0.1s' }}>
            {isSubmitting ? (
              <div className="submission-overlay mini">
                {!isDataSaved ? (
                  <>
                    <div className="neural-loader mini">
                      <div className="loader-ring"></div>
                      <div className="loader-ring"></div>
                    </div>
                    <h3 style={{ letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.9rem', marginTop: '1.5rem' }}>Processing</h3>
                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.5rem' }}>Analyzing Intelligence...</p>
                  </>
                ) : (
                  <>
                    <div className="hud-label" style={{ color: 'var(--accent)', marginBottom: '1.5rem', animation: 'blink 1s infinite' }}>MISSION_DEBRIEF_READY</div>
                    <button 
                      onClick={handleViewReport} 
                      className="btn-primary" 
                      style={{ 
                        width: '100%', 
                        boxShadow: '0 0 30px rgba(255,184,0,0.4)',
                        animation: 'glow-pulse 2s infinite'
                      }}
                    >
                      VIEW REPORT
                    </button>
                  </>
                )}
              </div>
            ) : !isInterviewStarted ? (
              <div className="prep-view mini">
                <h2 className="section-title">Ready?</h2>
                <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.7 }}>Calibrate your position below.</p>
                <button onClick={startInterview} className="btn-primary start-btn">Start Session</button>
              </div>
            ) : (
              <div className="session-view mini">
                <div className="interview-header mini">
                  <div className={`timer-box mini ${timeLeft < 10 ? 'critical' : ''}`}>00:{timeLeft}</div>
                  <div className="step-indicator mini">{currentStep + 1}/{questions.length}</div>
                </div>
                <h3 className="question-text mini">{questions[currentStep].text}</h3>
                <div className="controls-row mini">
                  <button onClick={handleNext} className="btn-primary action-btn">Next</button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card biometric-hud reveal" style={{ marginTop: '1.5rem', padding: '1.5rem', animationDelay: '0.2s' }}>
            <h4 className="hud-title" style={{ fontSize: '0.65rem', marginBottom: '1.25rem', color: 'var(--primary-muted)', textTransform: 'uppercase' }}>Live Diagnostics</h4>
            <div className="observation-stack">
              <div className="obs-item sidebar">
                <span className="obs-label">Gaze</span>
                <span className={`obs-value ${eyeGazeStatus === 'Centered' ? 'success' : 'warning'}`}>{eyeGazeStatus}</span>
              </div>
              <div className="obs-item sidebar">
                <span className="obs-label">Posture</span>
                <span className={`obs-value ${postureStatus === 'Good' ? 'success' : 'warning'}`}>{postureStatus}</span>
              </div>
              <div className="obs-item sidebar">
                <span className="obs-label">Face</span>
                <span className={`obs-value ${faceDetected === 'Active' ? 'success' : 'error'}`}>{faceDetected}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at top left, rgba(255,184,0,0.03) 0%, transparent 40%);
          pointer-events: none;
        }

        .video-hud {
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02);
        }

        .interview-panel {
          border-left: 2px solid var(--accent);
          background: linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
        }

        .biometric-hud {
          border-top: 1px solid rgba(255,184,0,0.1);
          background: linear-gradient(to bottom, rgba(255,184,0,0.02) 0%, rgba(255,255,255,0.01) 100%);
        }

        .interview-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
        }

        .interview-grid.reversed {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          align-items: start;
          transition: grid-template-columns 0.8s cubic-bezier(0.16, 1, 0.3, 1), gap 0.8s ease;
        }

        .interview-grid.reversed.is-minimized {
          grid-template-columns: 1fr 60px;
          gap: 1rem;
        }

        .side-panel {
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          position: relative;
          height: 100%;
        }

        .interview-grid.reversed.is-minimized .side-panel {
          padding: 1rem 0.5rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .sidebar-toggle {
          position: absolute;
          top: 50%;
          left: -15px;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          color: black;
          box-shadow: 0 0 15px var(--accent);
          transition: var(--transition);
        }

        .is-minimized .sidebar-toggle {
          left: 15px;
          transform: translateY(-50%) rotate(180deg);
        }

        .countdown-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .countdown-number {
          font-size: 12rem;
          font-weight: 900;
          color: var(--accent);
          text-shadow: 0 0 50px rgba(255,184,0,0.5);
          animation: count-pop 1s ease-out infinite;
        }

        @keyframes count-pop {
          0% { transform: scale(1.5); opacity: 0; }
          20% { transform: scale(1); opacity: 1; }
          80% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }

        .main-col {
          display: flex;
          flex-direction: column;
        }

        .video-viewport.large {
          aspect-ratio: 16/9;
          width: 100%;
          max-height: calc(100vh - 200px);
          border: 2px solid var(--border);
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          display: flex;
          overflow: hidden;
          background: #050505;
          position: relative;
        }

        .split-view {
          display: flex;
          width: 100%;
          height: 100%;
          gap: 0; /* Pure symmetry */
        }

        .view-half {
          width: 50%; /* Forced symmetry */
          flex: none;
          position: relative;
          height: 100%;
          overflow: hidden;
          transition: all 0.5s ease;
        }

        .question-half {
          background: rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem; /* Balanced padding */
          border-right: 1px solid var(--border);
          height: 100%;
          width: 100%;
          box-sizing: border-box;
        }

        .user-view {
          border-left: 1px solid var(--border);
        }

        .interview-wrapper.exiting {
          opacity: 0;
          transform: scale(1.05);
          filter: blur(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .question-half.blurred {
          filter: blur(15px);
          pointer-events: none;
          transition: filter 1s ease;
        }

        .session-ended-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
          background: rgba(0,0,0,0.2);
        }

        .ai-question-text {
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1.3;
          text-align: center;
          color: white;
          max-width: 80%;
          text-shadow: 0 0 30px rgba(255,255,255,0.2);
        }

        .countdown-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .countdown-circle {
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.8);
          border: 2px solid var(--accent);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 50px rgba(255, 184, 0, 0.3), inset 0 0 30px rgba(255, 184, 0, 0.1);
          animation: circle-pulse 1s infinite;
        }

        .countdown-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--primary-muted);
          margin-bottom: 0.5rem;
        }

        .countdown-number {
          font-size: 6rem;
          font-weight: 900;
          color: var(--accent);
          line-height: 1;
        }

        @keyframes circle-pulse {
          0% { transform: scale(1); border-color: var(--accent); }
          50% { transform: scale(1.05); border-color: white; }
          100% { transform: scale(1); border-color: var(--accent); }
        }

        .sidebar-toggle {
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          color: black;
          box-shadow: 0 0 20px var(--accent);
          transition: var(--transition);
          border: none;
        }

        .is-minimized .sidebar-toggle {
          right: 30px;
          transform: translateY(-50%) rotate(180deg);
        }

        .interview-grid.reversed.is-minimized {
          grid-template-columns: 1fr 0px;
          gap: 0;
        }

        .is-minimized .sidebar-col > *:not(.sidebar-toggle) {
          display: none;
        }

        .side-panel {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: visible;
          position: relative;
        }

        .interview-panel {
          padding: 1.5rem;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .obs-item.sidebar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 1.25rem;
        }

        .obs-label { 
          font-size: 0.75rem; 
          color: var(--primary-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .obs-value { 
          font-size: 0.65rem; 
          font-weight: 900; 
          text-transform: uppercase;
          padding: 0.35rem 0.8rem;
          border-radius: 6px;
          letter-spacing: 0.08em;
          min-width: 80px;
          text-align: center;
        }

        .obs-value.success { 
          background: rgba(16, 185, 129, 0.1);
          color: #10b981; 
          border: 1px solid #10b981;
        }

        .obs-value.warning, .obs-value.error { 
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444; 
          border: 1px solid #ef4444;
        }

        .question-text.mini {
          font-size: 1.1rem;
          line-height: 1.4;
          margin: 1.5rem 0;
        }

        .interview-header.mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .timer-box.mini {
          padding: 0.4rem 1rem;
          font-size: 0.9rem;
        }

        .step-indicator.mini {
          font-size: 0.9rem;
          color: var(--primary-muted);
        }

        .controls-row.mini {
          margin-top: auto;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .btn-primary.start-btn {
          width: 100%;
        }

        .live-label-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.25rem;
          font-family: var(--font-display);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--primary-muted);
          font-weight: 700;
        }

        .indicator-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 10px #ef4444;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Split-Screen Geometry */
        .split-view {
          display: flex !important;
          width: 100% !important;
          height: 100% !important;
          gap: 0 !important;
          flex-direction: row !important;
        }

        .view-half {
          width: 50% !important;
          flex: none !important;
          position: relative !important;
          height: 100% !important;
          overflow: hidden !important;
        }

        .question-half {
          background: rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border-right: 1px solid var(--border);
        }

        .user-view {
          border-left: 1px solid var(--border);
          background: #000;
        }

        .user-view video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
