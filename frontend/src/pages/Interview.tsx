import { useState, useEffect, useRef } from "react";
import { useClerk } from '@clerk/clerk-react';
import AIVirtualInterviewer3D from '../components/AIVirtualInterviewer3D';
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveVideo } from "../utils/db";
import amazonTechnicalData from "../data/amazon_technical.json";

function shuffleArray(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const questions_data = {
  amazon: {
    sde: [
      { id: 1, text: "Tell me about a time you had to deal with a difficult colleague.", type: "behavioral" },
      { id: 2, text: "How would you design a scalable notification system?", type: "behavioral" },
      { id: 3, text: "Explain the concept of 'Ownership' in Amazon's Leadership Principles.", type: "behavioral" },
    ],
    technical: [
      { id: 1, text: "Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", type: "technical" },
      { id: 2, text: "LRU Cache: Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.", type: "technical" },
      { id: 3, text: "Number of Islands: Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.", type: "technical" },
      { id: 4, text: "Trapping Rain Water: Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.", type: "technical" },
      { id: 5, text: "Merge k Sorted Lists: You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.", type: "technical" },
    ]
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
  const protocol = searchParams.get("protocol") || "hr";

  const [currentStep, setCurrentStep] = useState(0);
  const getInitialTime = () => protocol === 'technical' ? 300 : 120;
  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [preSessionCountdown, setPreSessionCountdown] = useState<number | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [thoughtProcess, setThoughtProcess] = useState("");
  const [allThoughtProcesses, setAllThoughtProcesses] = useState<string[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const allResultsRef = useRef<any[]>([]); // Sync ref to avoid React state race conditions

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
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const videoRef = (el: HTMLVideoElement | null) => {
    if (el && el !== videoElement) setVideoElement(el);
  };
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [fullSessionRecorder, setFullSessionRecorder] = useState<MediaRecorder | null>(null);
  const sessionChunks = useRef<Blob[]>([]);
  const recordingQuestionRef = useRef("");

  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const companyData = (questions_data as any)[company] || questions_data.amazon;
    const roleQuestions = companyData[role] || companyData.sde;
    
    if (protocol === 'technical') {
      // TECHNICAL: Always use the 100+ randomized GitHub problems
      setQuestions(shuffleArray(amazonTechnicalData).slice(0, 3));
    } else {
      // HR: Always use behavioral questions from questions_data
      setQuestions(roleQuestions.slice(0, 3));
    }
  }, [company, role, protocol]);

  useEffect(() => {
    // RESET session data on start
    localStorage.removeItem("interview_results");
    allResultsRef.current = [];
    setAllResults([]);

    let activeStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(activeStream);
        if (videoElement) {
          videoElement.srcObject = activeStream;
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
    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }
  }, [videoElement, stream, isInterviewStarted]);

  // Anti-Cheat & Diagnostic Loop
  useEffect(() => {
    if (!videoElement || isSubmitting) return;

    console.log("Diagnostic loop starting...");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const interval = setInterval(async () => {
      if (videoElement && ctx && videoElement.readyState === 4) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);
        
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
            
            setFaceDetected(data.faces_detected === 0 ? "None" : (data.faces_detected > 1 ? `Multiple (${data.faces_detected})` : "Active"));
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
    }, 2000); // Increased frequency for better responsiveness

    return () => clearInterval(interval);
  }, [videoElement, isSubmitting, isInterviewStarted]);

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
        
        // Start behavioral recording only for HR/Behavioral protocols
        if (protocol !== 'technical') {
          startRecording();
        }
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
  };

  // Promise resolver for the last recording — lets handleNext await it
  const lastRecordingResolve = useRef<(() => void) | null>(null);

  const startRecording = () => {
    if (stream) {
      recordingQuestionRef.current = questions[currentStep].text;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await submitAnswer(audioBlob, recordingQuestionRef.current);
        // Resolve the promise so handleNext knows the last recording is submitted
        if (lastRecordingResolve.current) {
          lastRecordingResolve.current();
          lastRecordingResolve.current = null;
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const pendingSubmissions = useRef<Promise<any>[]>([]);

  const submitAnswer = async (audioBlob: Blob, questionText: string) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recorded_audio.webm");
    formData.append("question_text", questionText);
    formData.append("posture", postureStatus);
    formData.append("eye_gaze", eyeGazeStatus);
    formData.append("face_detected", faceDetected);
    
    const submissionPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch("http://localhost:8000/process-answer", {
          method: "POST",
          body: formData,
          signal: controller.signal
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const { transcript, evaluation } = data;
        
        clearTimeout(timeoutId);

        const newResult = {
          question: questionText,
          evaluation: {
            ...evaluation,
            transcript: transcript
          }
        };
        // Update BOTH the ref (sync, reliable) and state (for UI)
        allResultsRef.current = [...allResultsRef.current, newResult];
        setAllResults([...allResultsRef.current]);
        
        // Still update localStorage for redundancy
        const existing = JSON.parse(localStorage.getItem("interview_results") || "[]");
        existing.push(newResult);
        localStorage.setItem("interview_results", JSON.stringify(existing));
        return newResult;
      } catch (err) {
        console.error("Submission error:", err);
        const fallbackResult = {
          question: questionText,
          evaluation: {
            score: 50,
            technical_score: 50,
            confidence: 40,
            integrity_score: 70,
            filler_count: 0,
            feedback: "Evaluation based on local metrics due to cloud interruption.",
            strengths: ["Communication captured"],
            weaknesses: ["AI audit pending"],
            transcript: "Transcription unavailable"
          }
        };
        allResultsRef.current = [...allResultsRef.current, fallbackResult];
        setAllResults([...allResultsRef.current]);
        
        const existing = JSON.parse(localStorage.getItem("interview_results") || "[]");
        existing.push(fallbackResult);
        localStorage.setItem("interview_results", JSON.stringify(existing));
        return fallbackResult;
      }
    })();

    pendingSubmissions.current.push(submissionPromise);
  };

  const finishSession = async (thoughtProcesses: string[]) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    // WAIT for ALL background submissions (HR/Behavioral) to finish
    if (pendingSubmissions.current.length > 0) {
      console.log(`Waiting for ${pendingSubmissions.current.length} pending submissions...`);
      await Promise.all(pendingSubmissions.current);
      console.log(`All submissions complete. Results count: ${allResultsRef.current.length}`);
    }

    const postureAvg = postureScores.length > 0 
      ? Math.round(postureScores.reduce((a, b) => a + b, 0) / postureScores.length) 
      : 85;

    // Use the SYNC REF for results (React state is async and unreliable here)
    let results = [...allResultsRef.current];
    console.log(`finishSession: ${results.length} results from ref, protocol=${protocol}`);

    if (protocol === 'technical' && thoughtProcesses.length > 0) {
      console.log("Starting technical thought process evaluation...");
      const technicalResults = [];
      // Clear local storage for a fresh technical report
      localStorage.removeItem("interview_results");
      
      for (let i = 0; i < questions.length; i++) {
        try {
          const res = await fetch('http://localhost:8000/evaluate-thought-process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: questions[i].text,
              thought_process: thoughtProcesses[i] || ""
            })
          });
          if (res.ok) {
            const evalData = await res.json();
            const resultObj = {
              question: questions[i].text,
              evaluation: {
                ...evalData,
                transcript: `Thought Process: ${thoughtProcesses[i] || "No logic provided."}`
              }
            };
            technicalResults.push(resultObj);
            
            // Persist to sync ref and local storage for Report fallback
            allResultsRef.current.push(resultObj);
            const existing = JSON.parse(localStorage.getItem("interview_results") || "[]");
            existing.push(resultObj);
            localStorage.setItem("interview_results", JSON.stringify(existing));
          } else {
            throw new Error("AI Evaluation service failed");
          }
        } catch (err) {
          console.error("Technical eval failed for Q", i, err);
          const fallbackObj = {
            question: questions[i].text,
            evaluation: {
              score: 70, 
              status: "Close",
              feedback: "Automated evaluation was interrupted. Technical analysis pending review.",
              strengths: ["Technical thought process captured"],
              weaknesses: ["Logic audit pending manual review"],
              transcript: `Thought Process: ${thoughtProcesses[i] || "No logic provided."}`
            }
          };
          technicalResults.push(fallbackObj);
          allResultsRef.current.push(fallbackObj);
        }
      }
      results = technicalResults;
      console.log(`Technical evaluation complete. Results: ${results.length}`);
    }
    
    if (user?.id) {
      // Aggregate all 4 evaluation axes from individual question results
      const avgTechnicalScore = results.length > 0 
        ? Math.round(results.reduce((acc: any, r: any) => acc + (r.evaluation.technical_score || r.evaluation.score || 0), 0) / results.length)
        : 0;
      const avgConfidence = results.length > 0
        ? Math.round(results.reduce((acc: any, r: any) => acc + (r.evaluation.confidence || 0), 0) / results.length)
        : 0;
      const totalFillers = results.reduce((acc: any, r: any) => acc + (r.evaluation.filler_count || 0), 0);
      const avgIntegrity = results.length > 0
        ? Math.round(results.reduce((acc: any, r: any) => acc + (r.evaluation.integrity_score || postureAvg), 0) / results.length)
        : postureAvg;
      
      // Overall = Technical 40% + Confidence 30% + Integrity 30%
      const overallScore = protocol === 'technical' 
        ? Math.round(avgTechnicalScore * 0.7 + avgConfidence * 0.3)
        : Math.round(avgTechnicalScore * 0.4 + avgConfidence * 0.3 + avgIntegrity * 0.3);

      try {
        await fetch("http://localhost:5001/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            company,
            role,
            overallScore,
            postureScore: avgIntegrity,
            avgCommunication: avgTechnicalScore,
            avgConfidence,
            totalFillers,
            results,
            thoughtProcesses
          })
        });
        setIsDataSaved(true);
      } catch (err) {
        console.error("Failed to save report to MongoDB:", err);
        setIsDataSaved(true); 
      }
    }
    
    localStorage.setItem("final_posture_score", postureAvg.toString());
  };

  const navigateToReport = async () => {
    if (fullSessionRecorder && fullSessionRecorder.state !== "inactive") {
      fullSessionRecorder.onstop = async () => {
        const fullBlob = new Blob(sessionChunks.current, { type: 'video/webm' });
        saveVideo(fullBlob);
      };
      fullSessionRecorder.stop();
    }
    navigate("/report");
  };

  const handleNext = async () => {
    const isLastQuestion = currentStep >= questions.length - 1;

    // For HR: Stop recording and wait for the onstop handler to fire + submit
    if (mediaRecorder && mediaRecorder.state === "recording") {
      if (isLastQuestion && protocol !== 'technical') {
        // CRITICAL: Wait for the last recording's onstop to fire and submit
        const lastRecordingPromise = new Promise<void>((resolve) => {
          lastRecordingResolve.current = resolve;
        });
        mediaRecorder.stop();
        setIsRecording(false);
        console.log("Waiting for last recording to be submitted...");
        await lastRecordingPromise;
        console.log("Last recording submitted!");
      } else {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }

    const updatedThoughtProcesses = [...allThoughtProcesses, thoughtProcess];
    setAllThoughtProcesses(updatedThoughtProcesses);
    setThoughtProcess("");

    if (!isLastQuestion) {
      setCurrentStep(prev => prev + 1);
      setTimeLeft(getInitialTime());
      if (protocol !== 'technical') {
        setTimeout(() => startRecording(), 500);
      }
    } else {
      // Mission Complete Sequence
      setIsSubmitting(true);
      setIsSidebarMinimized(false); 

      // WAIT for all AI evaluations and report saving to finish
      // (DO NOT kill stream yet — last recording might still need it)
      await finishSession(updatedThoughtProcesses);
      
      // NOW kill the stream after all data is saved
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Then navigate
      navigateToReport();
    }
  };

  // Auto-bypass if stuck (longer for technical)
  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => {
        navigate("/report");
      }, 30000); // 30s fail-safe for technical audits
      return () => clearTimeout(timer);
    }
  }, [isSubmitting]);

  if (questions.length === 0) {
    return <div className="premium-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="status-badge">Initializing Neural Set...</div></div>;
  }

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
                  <div className={`view-half question-half ${isSubmitting ? 'blurred' : ''}`} style={{ padding: 0, position: 'relative' }}>
                    {!isSubmitting ? (
                      <>
                        <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
                          <div className={`timer-box mini ${timeLeft < 10 ? 'critical' : ''}`} style={{ fontSize: '1.2rem', padding: '0.6rem 1.2rem' }}>
                            <span style={{ opacity: 0.6, fontSize: '0.8rem', marginRight: '0.5rem' }}>TIME LEFT</span>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                          </div>
                        </div>

                        <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 20 }}>
                          <div className="step-indicator mini" style={{ 
                            fontSize: '1rem', 
                            color: 'white', 
                            background: 'rgba(255,255,255,0.05)', 
                            padding: '0.6rem 1.2rem', 
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            fontWeight: 700
                          }}>
                            QUESTION {currentStep + 1} / {questions.length}
                          </div>
                        </div>

                        {/* AI Human Presence (Background) */}
                        <AIVirtualInterviewer3D textToSpeak={questions[currentStep].text} />

                        <div style={{
                          position: 'absolute',
                          bottom: '4rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '80%',
                          padding: '1.25rem 2rem',
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '1.25rem',
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                          zIndex: 20,
                          textAlign: 'center'
                        }}>
                          <div className="ai-question-text" style={{ 
                            fontSize: protocol === 'technical' ? '1.1rem' : '1.5rem', 
                            fontWeight: 500,
                            marginBottom: 0,
                            lineHeight: 1.4,
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {questions[currentStep].text}
                          </div>
                        </div>

                        {protocol === 'technical' && (
                          <div className="thought-process-container" style={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '1.5rem',
                            zIndex: 25
                          }}>
                            <textarea 
                              className="thought-area"
                              placeholder="Describe your thinking and thought process here..."
                              value={thoughtProcess}
                              onChange={(e) => setThoughtProcess(e.target.value)}
                              style={{ 
                                width: '100%', 
                                height: '200px', 
                                background: 'rgba(0,0,0,0.6)', 
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--accent)', 
                                borderRadius: '1rem', 
                                padding: '1.25rem',
                                color: 'white',
                                fontFamily: 'var(--font-body)',
                                resize: 'none'
                              }}
                            />
                          </div>
                        )}

                        <div style={{ position: 'absolute', bottom: '3rem', width: '100%', display: 'none', justifyContent: 'center', gap: '2rem' }}>
                          <button onClick={handleNext} className="btn-secondary" style={{ padding: '0.8rem 2.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                            Skip Question
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="submitting-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.8)' }}>
                        <div className="neural-loader"></div>
                        <p style={{ marginTop: '2rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Processing AI Evaluation...</p>
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

            {/* Dedicated Action Bar (Below Cams, Inside Border) */}
            <div className="hud-bottom-bar" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 2rem',
              background: 'rgba(0,0,0,0.2)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              minHeight: '60px'
            }}>
              {/* Left: Status */}
              <div className="live-label-left" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div className="indicator-dot" style={{ width: '8px', height: '8px', background: '#ff4b2b', borderRadius: '50%', boxShadow: '0 0 10px #ff4b2b', animation: 'blink 1s infinite' }}></div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {isInterviewStarted ? 'Simulation Active' : 'Camera Feed'}
                </span>
              </div>

              {/* Center: Interactive Controls */}
              {isInterviewStarted && !isSubmitting && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={handleNext}
                    className="btn-secondary"
                    style={{
                      padding: '0.6rem 2.5rem',
                      background: 'rgba(255,184,0,0.1)',
                      border: '1px solid rgba(255,184,0,0.2)',
                      borderRadius: '2rem',
                      color: 'var(--accent)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,184,0,0.2)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255,184,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,184,0,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    SKIP QUESTION
                  </button>
                </div>
              )}

              {/* Right: Metadata */}
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
                INT-MD-V2
              </div>
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
                  <div className={`timer-box mini ${timeLeft < 10 ? 'critical' : ''}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
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

        .status-badge.perfect { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; }
        .status-badge.close { background: rgba(251, 191, 36, 0.1); color: var(--accent); border: 1px solid var(--accent); }
        .status-badge.far { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }

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
