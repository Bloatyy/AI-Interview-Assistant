import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Default Ready Player Me Avatar (Professional Male)
const AVATAR_URL = "https://models.readyplayer.me/64f09a9603096b42b10a5631.glb?morphTargets=ARKit,Oculus+Visemes";

function Avatar({ textToSpeak }: { textToSpeak: string }) {
    const { scene } = useGLTF(AVATAR_URL) as any;
    const group = useRef<THREE.Group>(null);
    const [isTalking, setIsTalking] = useState(false);
    const headNode = useRef<any>(null);
    const blinkTimer = useRef(0);

    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh && child.morphTargetDictionary) {
                if (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('face')) {
                    headNode.current = child;
                }
            }
        });
        // Force a reasonable scale
        scene.scale.set(1, 1, 1);
    }, [scene]);

    // ... (rest of the speak logic remains the same)
    
    useEffect(() => {
        if (textToSpeak) {
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => speak(textToSpeak);
            } else {
                speak(textToSpeak);
            }
        }
    }, [textToSpeak]);

    const speak = (text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Priority: Google US English -> Google UK English -> Any English -> First Voice
        const preferredVoice = voices.find(v => v.name === 'Google US English')
            || voices.find(v => v.name === 'Google UK English Male')
            || voices.find(v => v.lang === 'en-US' && v.name.includes('Neural'))
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0; 
        
        utterance.onstart = () => setIsTalking(true);
        utterance.onend = () => { setIsTalking(false); resetMouth(); };
        utterance.onboundary = (event) => { if (event.name === 'word') triggerMouthMove(); };
        window.speechSynthesis.speak(utterance);
    };

    const triggerMouthMove = () => {
        if (!headNode.current) return;
        const dict = headNode.current.morphTargetDictionary;
        const influence = headNode.current.morphTargetInfluences;
        const mouthOpenTarget = dict['viseme_aa'] || dict['mouthOpen'] || dict['jawOpen'];
        if (mouthOpenTarget !== undefined) {
            influence[mouthOpenTarget] = 0.6;
            setTimeout(() => { if (influence) influence[mouthOpenTarget] = 0; }, 80);
        }
    };

    const resetMouth = () => {
        if (!headNode.current) return;
        const dict = headNode.current.morphTargetDictionary;
        const influence = headNode.current.morphTargetInfluences;
        Object.keys(dict).forEach(key => { if (dict[key] !== undefined) influence[dict[key]] = 0; });
    };

    useFrame((state, delta) => {
        if (!headNode.current || !group.current) return;
        const dict = headNode.current.morphTargetDictionary;
        const influences = headNode.current.morphTargetInfluences;

        blinkTimer.current += delta;
        if (blinkTimer.current > 4) {
            const blinkIndex = dict['eyeBlinkLeft'] || dict['eyesClosed'];
            if (blinkIndex !== undefined) {
                influences[blinkIndex] = Math.sin(blinkTimer.current * 20) > 0 ? 1 : 0;
                const blinkIndexR = dict['eyeBlinkRight'] || dict['eyesClosed'];
                if (blinkIndexR !== undefined) influences[blinkIndexR] = influences[blinkIndex];
            }
            if (blinkTimer.current > 4.2) blinkTimer.current = 0;
        }

        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
        group.current.position.y = -1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;

        if (isTalking) {
            const jawIndex = dict['viseme_O'] || dict['jawOpen'];
            if (jawIndex !== undefined) influences[jawIndex] = THREE.MathUtils.lerp(influences[jawIndex], Math.random() * 0.4, 0.3);
        }
    });

    return <primitive object={scene} ref={group} />;
}

// Error Boundary Component to prevent crashes if WebGL or Model fails
class AvatarErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white'
                }}>
                    <img 
                        src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800" 
                        alt="AI Interviewer" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1.0 }}
                    />
                </div>
            );
        }
        return this.props.children;
    }
}

const AIVirtualInterviewer3D: React.FC<{ textToSpeak: string }> = ({ textToSpeak }) => {
    const [loadError, setLoadError] = useState(false);

    return (
        <div className="avatar-container-3d" style={{ 
            width: '100%', height: '100%', position: 'relative', borderRadius: '1.5rem', overflow: 'hidden',
            background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
            {!loadError ? (
                <Suspense fallback={<div className="neural-loader-overlay">Connecting AI...</div>}>
                    <AvatarErrorBoundary>
                        <Canvas shadows camera={{ position: [0, 0, 2.2], fov: 40 }} dpr={[1, 2]} onError={() => setLoadError(true)}>
                            <color attach="background" args={['#0a0a0f']} />
                            <ambientLight intensity={0.8} />
                            <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                            <pointLight position={[0, 0, 2]} intensity={1} color="#ffffff" />
                            <Avatar textToSpeak={textToSpeak} />
                            <Environment preset="studio" />
                            <ContactShadows opacity={0.5} scale={10} blur={1} far={10} />
                        </Canvas>
                    </AvatarErrorBoundary>
                </Suspense>
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#020617' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800" 
                        alt="AI Interviewer" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            )}

        </div>
    );
};

export default AIVirtualInterviewer3D;
