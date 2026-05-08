import React, { useEffect, useRef, useState } from 'react';

interface AIVirtualInterviewerProps {
    textToSpeak: string;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
}

const AIVirtualInterviewer: React.FC<AIVirtualInterviewerProps> = ({ textToSpeak, onSpeechStart, onSpeechEnd }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [streamId, setStreamId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Initializing AI...');
    const [isAvatarReady, setIsAvatarReady] = useState(false);

    const prevTextRef = useRef<string>("");

    useEffect(() => {
        setupDIdSession();
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (isAvatarReady && textToSpeak && textToSpeak !== prevTextRef.current) {
            prevTextRef.current = textToSpeak;
            triggerSpeak(textToSpeak);
        }
    }, [textToSpeak, isAvatarReady]);

    const setupDIdSession = async () => {
        try {
            setStatus('Connecting to D-ID...');
            const response = await fetch('http://localhost:5001/api/did/session', { method: 'POST' });
            const sessionData = await response.json();
            
            if (sessionData.error) throw new Error(sessionData.error);

            const { id: sId, offer, ice_servers, stream_id } = sessionData;
            setSessionId(sId);
            setStreamId(stream_id);

            peerConnection.current = new RTCPeerConnection({ iceServers: ice_servers });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
                    fetch(`http://localhost:5001/api/did/session/${sId}/ice`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex })
                    });
                }
            };

            peerConnection.current.ontrack = (event) => {
                if (videoRef.current && event.streams[0]) {
                    videoRef.current.srcObject = event.streams[0];
                    setIsAvatarReady(true);
                    setStatus('AI Interviewer Ready');
                }
            };

            await peerConnection.current.setRemoteDescription(offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            await fetch(`http://localhost:5001/api/did/session/${sId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });

        } catch (err) {
            console.error('D-ID Setup Error:', err);
            setStatus('Avatar Offline (Check API Key)');
        }
    };

    const triggerSpeak = async (text: string) => {
        if (!sessionId) return;
        try {
            onSpeechStart?.();
            await fetch(`http://localhost:5001/api/did/session/${sessionId}/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
        } catch (err) {
            console.error('D-ID Speak Error:', err);
        }
    };

    return (
        <div className="avatar-container" style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative', 
            borderRadius: '1.5rem', 
            overflow: 'hidden',
            background: '#000',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {status !== 'AI Interviewer Ready' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 10
                }}>
                    <div className="neural-loader" style={{ marginBottom: '1rem' }}>
                        <div className="loader-ring"></div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {status}
                    </span>
                </div>
            )}

            {/* Overlays */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAvatarReady ? '#10b981' : '#f59e0b' }}></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>
                    {isAvatarReady ? 'VIRTUAL INTERVIEWER ACTIVE' : 'INITIALIZING...'}
                </span>
            </div>
        </div>
    );
};

export default AIVirtualInterviewer;
