import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { getVideo } from "../utils/db";

export default function Report() {
  const [postureScore, setPostureScore] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const score = localStorage.getItem("final_posture_score");
    if (score) setPostureScore(parseInt(score));
    
    const interviewResults = localStorage.getItem("interview_results");
    if (interviewResults) {
      setResults(JSON.parse(interviewResults));
    } else {
      // Hardcoded Mock Report for immediate visibility
      setResults([
        {
          question: "Tell me about a time you had to deal with a difficult colleague.",
          evaluation: {
            score: 85,
            feedback: "Great use of the STAR method. You clearly identified the conflict and demonstrated strong emotional intelligence.",
            strengths: ["Clear communication", "Resolution-oriented approach", "Professional tone"],
            weaknesses: ["Could provide more metrics on the outcome"],
            transcript: "In my previous role, I had a teammate who was resistant to new workflows. I scheduled a one-on-one to understand their concerns and we eventually found a middle ground that improved our sprint velocity by 15%."
          }
        },
        {
          question: "How would you design a scalable notification system?",
          evaluation: {
            score: 92,
            feedback: "Excellent technical depth. Your mention of message queues and database sharding shows senior-level architectural thinking.",
            strengths: ["System design expertise", "Scalability focus", "Attention to edge cases"],
            weaknesses: ["Didn't mention cost optimization"],
            transcript: "I would use a microservices architecture with a Pub/Sub model using Redis or Kafka. For the database, I'd use a NoSQL solution for high-write performance and implement a CDN for static notification assets."
          }
        }
      ]);
      setPostureScore(88);
    }

    const loadVideo = async () => {
      const blob = await getVideo();
      if (blob) {
        setVideoUrl(URL.createObjectURL(blob));
      }
    };
    loadVideo();
  }, []);

  const avgCommScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.evaluation.score, 0) / results.length)
    : 0;

  const avgConfidence = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.evaluation.confidence || 0), 0) / results.length)
    : 0;

  const totalFillers = results.reduce((acc, r) => acc + (r.evaluation.filler_count || 0), 0);

  const overallScore = results.length > 0
    ? Math.round(avgCommScore * 0.4 + avgConfidence * 0.3 + postureScore * 0.3)
    : postureScore;

  const downloadReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      overallScore,
      postureScore,
      averageCommunication: avgCommScore,
      totalFillers,
      results
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "interview_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="premium-container page-padding">
      <div className="report-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Your Interview <span className="text-gradient">Report</span></h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '2rem 4rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent-color)' }}>{overallScore}%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Performance</div>
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

      <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Confidence</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: 'var(--accent-color)' }}>{avgConfidence}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Derived from speech fluency and directness.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Filler Words</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: '#fbbf24' }}>{totalFillers}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total 'um', 'uh', 'like' detected.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Integrity</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: '#10b981' }}>{postureScore}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Camera presence and posture consistency.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3>Technical</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: 'var(--primary-color)' }}>{avgCommScore}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy and depth of technical answers.</p>
        </div>
      </div>

      <div className="detailed-breakdown">
        <h2 style={{ marginBottom: '2rem' }}>Detailed Breakdown</h2>
        {results.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No question results found. Complete an interview to see analysis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {results.map((res, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase' }}>Question {idx + 1}</span>
                    <h3 style={{ marginTop: '0.5rem' }}>{res.question}</h3>
                  </div>
                  <div className="score-badge" style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontWeight: 700 }}>
                    {res.evaluation.score}%
                  </div>
                </div>

                <div className="transcript-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Transcription (Whisper AI)</span>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{res.evaluation.transcript || 'No response detected.'}"</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Strengths
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                      {res.evaluation.strengths && res.evaluation.strengths.length > 0 ? res.evaluation.strengths.map((g: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{g}</li>) : <li>No specific strengths noted.</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Areas for Improvement
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                      {res.evaluation.weaknesses && res.evaluation.weaknesses.length > 0 ? res.evaluation.weaknesses.map((imp: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{imp}</li>) : <li>No specific improvements noted.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link to="/" className="btn-primary no-print" style={{ padding: '1rem 4rem', fontSize: '1.1rem' }}>
          Practice Again
        </Link>
      </div>
    </div>
  );
}
