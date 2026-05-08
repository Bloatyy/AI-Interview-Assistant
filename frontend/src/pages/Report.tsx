import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { getVideo, getQuestionVideo } from "../utils/db";

export default function Report() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    const fetchLatestReport = async () => {
      let dataFound = false;
      try {
        const res = await fetch(`http://localhost:5001/api/reports/latest/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            setReport(data);
            dataFound = true;
          }
        }
      } catch (err) {
        console.error("Error fetching latest report from backend:", err);
      }

      if (!dataFound) {
        // FALLBACK: If backend fails or is empty, try localStorage
        console.log("No backend report found, checking localStorage fallback...");
        const localResults = JSON.parse(localStorage.getItem("interview_results") || "[]");
        
        if (localResults.length > 0) {
          // Detect if technical (usually has "Thought Process" in transcript)
          const isTech = localResults.some((r: any) => r.evaluation?.transcript?.includes("Thought Process:"));
          
          const avgConf = Math.round(localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.confidence || 0), 0) / localResults.length);
          const avgTech = Math.round(localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.technical_score || r.evaluation?.score || 0), 0) / localResults.length);
          const avgInt = Math.round(localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.integrity_score || 85), 0) / localResults.length);
          const totalF = localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.filler_count || 0), 0);
          
          // Technical = Tech 70% + Conf 30% | HR = Tech 40% + Conf 30% + Integrity 30%
          const overall = isTech 
            ? Math.round(avgTech * 0.7 + avgConf * 0.3)
            : Math.round(avgTech * 0.4 + avgConf * 0.3 + avgInt * 0.3);

          setReport({
            overallScore: overall,
            avgConfidence: avgConf,
            avgCommunication: avgTech,
            totalFillers: totalF,
            postureScore: avgInt,
            results: localResults
          });
        }
      }
      setIsLoading(false);
    };

    fetchLatestReport();

    const loadVideo = async () => {
      try {
        const blob = await getVideo();
        if (blob) {
          setVideoUrl(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.error("Video load error:", err);
      }
    };
    loadVideo();
  }, []);

  const overallScore = report?.overallScore || 0;
  const integrityScore = report?.postureScore || 0;
  const technicalScore = report?.avgCommunication || 0;
  const avgConfidence = report?.avgConfidence || 0;
  const totalFillers = report?.totalFillers || 0;
  const results = report?.results || [];

  // Calculate filler score (inverse — fewer fillers = higher score)
  const fillerScore = Math.max(0, 100 - (totalFillers * 8));

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#fbbf24';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const downloadReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      overallScore,
      confidence: avgConfidence,
      totalFillers,
      fillerScore,
      integrityScore,
      technicalScore,
      results: results.map((r: any) => ({
        question: r.question,
        transcript: r.evaluation?.transcript,
        score: r.evaluation?.score,
        confidence: r.evaluation?.confidence,
        technical_score: r.evaluation?.technical_score,
        integrity_score: r.evaluation?.integrity_score,
        filler_count: r.evaluation?.filler_count,
        filler_breakdown: r.evaluation?.filler_breakdown,
        feedback: r.evaluation?.feedback,
        strengths: r.evaluation?.strengths,
        weaknesses: r.evaluation?.weaknesses
      }))
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "interview_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="premium-container page-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="neural-loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
      </div>
    );
  }

  const playQuestionVideo = async (idx: number) => {
    try {
      const blob = await getQuestionVideo(idx);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setActiveVideoUrl(url);
      } else {
        alert("Video clip not found for this question.");
      }
    } catch (err) {
      console.error("Error playing question video:", err);
    }
  };

  return (
    <div className="premium-container page-padding">
      {/* Video Modal Overlay */}
      {activeVideoUrl && (
        <div className="video-modal-overlay" onClick={() => setActiveVideoUrl(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Answer Replay</h3>
              <button onClick={() => setActiveVideoUrl(null)} className="close-btn">✕</button>
            </div>
            <video src={activeVideoUrl} autoPlay controls style={{ width: '100%', borderRadius: '1rem' }} />
          </div>
        </div>
      )}
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>

      <div className="report-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Your Interview <span className="text-gradient">Report</span></h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '2rem 4rem', border: `2px solid ${getScoreColor(overallScore)}` }}>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: getScoreColor(overallScore) }}>{overallScore}%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Performance</div>
            <div style={{ 
              display: 'inline-block', 
              marginTop: '0.5rem', 
              padding: '0.3rem 1rem', 
              borderRadius: '4px', 
              background: `${getScoreColor(overallScore)}15`, 
              color: getScoreColor(overallScore), 
              fontWeight: 700,
              fontSize: '1.2rem',
              border: `1px solid ${getScoreColor(overallScore)}`
            }}>
              Grade: {getGrade(overallScore)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => window.print()} 
              className="btn-secondary no-print" 
              style={{ padding: '0.8rem 2rem', width: '200px' }}
            >
              Print PDF
            </button>
            <button 
              onClick={downloadReport} 
              className="btn-primary no-print" 
              style={{ padding: '0.8rem 2rem', width: '200px' }}
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>

      {videoUrl && (
        <div className="glass-card no-print" style={{ padding: '2rem', marginBottom: '4rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Session Replay</h3>
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: '1rem', background: '#000' }} />
        </div>
      )}

      {/* === 4 METRIC CARDS === */}
      <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* CONFIDENCE */}
        <div className="glass-card metric-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${getScoreColor(avgConfidence)}, transparent)` }}></div>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Confidence</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0', color: getScoreColor(avgConfidence), lineHeight: 1 }}>{avgConfidence}%</div>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px', 
            background: `${getScoreColor(avgConfidence)}15`, 
            color: getScoreColor(avgConfidence), 
            fontSize: '0.7rem', 
            fontWeight: 700,
            marginBottom: '0.8rem',
            border: `1px solid ${getScoreColor(avgConfidence)}30`
          }}>{getGrade(avgConfidence)}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Speech fluency, directness, and assertiveness of your answers.</p>
        </div>

        {/* FILLER WORDS */}
        <div className="glass-card metric-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, #fbbf24, transparent)` }}></div>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Filler Words</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{totalFillers}</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>detected</div>
          </div>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px', 
            background: totalFillers <= 3 ? '#10b98115' : totalFillers <= 8 ? '#fbbf2415' : '#ef444415', 
            color: totalFillers <= 3 ? '#10b981' : totalFillers <= 8 ? '#fbbf24' : '#ef4444', 
            fontSize: '0.7rem', 
            fontWeight: 700,
            marginBottom: '0.8rem',
            border: `1px solid ${totalFillers <= 3 ? '#10b98130' : totalFillers <= 8 ? '#fbbf2430' : '#ef444430'}`
          }}>{totalFillers <= 3 ? 'Excellent' : totalFillers <= 8 ? 'Moderate' : 'High Usage'}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Total "um", "uh", "like", "you know", "basically" detected across all answers.</p>
        </div>

        {/* PROFESSIONALISM */}
        <div className="glass-card metric-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${getScoreColor(integrityScore)}, transparent)` }}></div>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Professionalism</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0', color: getScoreColor(integrityScore), lineHeight: 1 }}>{integrityScore}%</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <div style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: '4px', 
              background: `${getScoreColor(integrityScore)}15`, 
              color: getScoreColor(integrityScore), 
              fontSize: '0.7rem', 
              fontWeight: 700,
              border: `1px solid ${getScoreColor(integrityScore)}30`
            }}>{getGrade(integrityScore)}</div>
            {results[0]?.evaluation?.attire && (
              <div style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                {capitalize(results[0].evaluation.attire)}
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Professional attire, grooming, posture, and gaze stability analysis.</p>
        </div>

        {/* TECHNICAL */}
        <div className="glass-card metric-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${getScoreColor(technicalScore)}, transparent)` }}></div>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Technical</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0', color: getScoreColor(technicalScore), lineHeight: 1 }}>{technicalScore}%</div>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px', 
            background: `${getScoreColor(technicalScore)}15`, 
            color: getScoreColor(technicalScore), 
            fontSize: '0.7rem', 
            fontWeight: 700,
            marginBottom: '0.8rem',
            border: `1px solid ${getScoreColor(technicalScore)}30`
          }}>{getGrade(technicalScore)}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Accuracy, depth, and correctness of your technical/behavioral answers.</p>
        </div>
      </div>

      {/* === SCORE FORMULA EXPLANATION === */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '4rem', borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score Formula</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            Overall = Technical × 0.4 + Confidence × 0.3 + Professionalism × 0.3
          </span>
        </div>
      </div>

      {/* === DETAILED PER-QUESTION BREAKDOWN === */}
      <div className="detailed-breakdown">
        <h2 style={{ marginBottom: '2rem' }}>Detailed Breakdown</h2>
        {results.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No question results found. Complete an interview to see analysis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {results.map((res: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Question {idx + 1}</span>
                    <h3 style={{ marginTop: '0.5rem' }}>{res.question}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => playQuestionVideo(idx)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Replay Answer
                    </button>
                    <div className="score-badge" style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: `1px solid ${getScoreColor(res.evaluation?.score || 0)}`, color: getScoreColor(res.evaluation?.score || 0), fontWeight: 700, fontSize: '1.1rem' }}>
                      {res.evaluation?.score || 0}%
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="transcript-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Transcription (Whisper AI)</span>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{res.evaluation?.transcript || 'No response detected.'}"</p>
                </div>

                {/* Per-Question Mini Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Confidence</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(res.evaluation?.confidence || 0) }}>{res.evaluation?.confidence || 0}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Fillers</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>{res.evaluation?.filler_count || 0}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Integrity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(res.evaluation?.integrity_score || 0) }}>{res.evaluation?.integrity_score || 0}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Technical</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(res.evaluation?.technical_score || res.evaluation?.score || 0) }}>{res.evaluation?.technical_score || res.evaluation?.score || 0}%</div>
                  </div>
                </div>

                {/* Filler Word Breakdown (if any) */}
                {res.evaluation?.filler_breakdown && Object.keys(res.evaluation.filler_breakdown).length > 0 && (
                  <div style={{ background: 'rgba(251,191,36,0.05)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Filler Words Detected</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {Object.entries(res.evaluation.filler_breakdown).map(([word, count]: [string, any]) => (
                        <span key={word} style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '999px', 
                          background: 'rgba(251,191,36,0.1)', 
                          color: '#fbbf24', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          border: '1px solid rgba(251,191,36,0.2)'
                        }}>
                          "{word}" × {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {res.evaluation?.feedback && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>AI Feedback</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{res.evaluation.feedback}</p>
                  </div>
                )}

                {/* Analysis Insights */}
                {(res.evaluation?.confidence_analysis || res.evaluation?.technical_analysis || res.evaluation?.integrity_analysis) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {res.evaluation?.confidence_analysis && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', borderTop: `2px solid ${getScoreColor(res.evaluation?.confidence || 0)}` }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Confidence Insight</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{res.evaluation.confidence_analysis}</p>
                      </div>
                    )}
                    {res.evaluation?.technical_analysis && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', borderTop: '2px solid #3b82f6' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Technical Insight</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{res.evaluation.technical_analysis}</p>
                      </div>
                    )}
                    {res.evaluation?.integrity_analysis && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', borderTop: '2px solid #10b981' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Integrity Insight</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{res.evaluation.integrity_analysis}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Strengths
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                      {res.evaluation?.strengths && res.evaluation.strengths.length > 0 ? res.evaluation.strengths.map((g: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{g}</li>) : <li>No specific strengths noted.</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Areas for Improvement
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                      {res.evaluation?.weaknesses && res.evaluation.weaknesses.length > 0 ? res.evaluation.weaknesses.map((imp: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{imp}</li>) : <li>No specific improvements noted.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="no-print" style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
        <Link to="/dashboard" className="btn-primary" style={{ padding: '1rem 4rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
          RETURN TO DASHBOARD
        </Link>
      </div>

      <style>{`
        .premium-container {
          max-width: 100% !important;
          margin: 0 !important;
          width: 100% !important;
          padding-left: 4rem !important;
          padding-right: 4rem !important;
          position: relative;
          min-height: 100vh;
          background: #000;
          color: white;
        }

        .glass-card {
          transition: var(--transition);
        }

        .glass-card:hover {
          background: rgba(255,255,255,0.04);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .metric-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }

        @media print {
          .no-print { display: none !important; }
        }

        .video-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .video-modal-content {
          width: 100%;
          max-width: 800px;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.5rem;
          padding: 1.5rem;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        }

        .close-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .close-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
        }
      `}
      </style>
    </div>
  );
}
