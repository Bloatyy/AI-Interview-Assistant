import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const resourceMap: Record<string, { title: string, url: string }> = {
  'technical': {
    title: 'Technical Preparation',
    url: 'https://www.scribd.com/embeds/967242780/content'
  },
  'behavioral': {
    title: 'General & Behavioral',
    url: 'https://www.scribd.com/embeds/958206045/content'
  },
  'cv': {
    title: 'CV & Resume Optimization',
    url: 'https://www.scribd.com/embeds/932935469/content'
  }
};

export default function ResourceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = id ? resourceMap[id] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!resource) {
    return (
      <div className="premium-container page-padding" style={{ textAlign: 'center', marginTop: '10rem' }}>
        <h1 className="hero-title">Resource <span className="text-gradient">Not Found</span></h1>
        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '2rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="premium-container page-padding dashboard-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>

      <header className="dashboard-header reveal" style={{ marginBottom: '2rem' }}>
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
          <div>
            <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {resource.title} <span className="text-gradient">Module</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: 0 }}>Advanced learning path initialized.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>
        </div>
      </header>

      <div className="glass-card reveal" style={{ flex: 1, padding: '1rem', overflow: 'hidden', border: '1px solid var(--accent)', boxShadow: '0 0 40px rgba(251, 191, 36, 0.1)' }}>
        <iframe 
          src={resource.url}
          style={{ 
            width: '100%', 
            height: '800px', 
            border: 'none',
            borderRadius: '12px',
            background: 'white'
          }}
          title={resource.title}
          allowFullScreen
        ></iframe>
      </div>

      <style>{`
        .dashboard-header {
            max-width: none;
            width: 100%;
        }
        .header-content {
            width: 100%;
        }
      `}</style>
    </div>
  );
}
