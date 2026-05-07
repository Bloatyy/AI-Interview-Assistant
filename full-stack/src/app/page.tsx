"use client";

import { useState } from "react";
import Link from "next/link";

const companies = [
  { id: "amazon", name: "Amazon", logo: "📦" },
  { id: "google", name: "Google", logo: "🔍" },
  { id: "meta", name: "Meta", logo: "♾️" },
];

const roles = [
  { id: "sde", name: "Software Engineer", icon: "💻" },
  { id: "data", name: "Data Analyst", icon: "📊" },
  { id: "android", name: "Android Developer", icon: "🤖" },
];

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const isReady = selectedCompany && selectedRole;

  return (
    <div className="premium-container page-padding">
      <section className="hero-section">
        <h1 className="animate-fade-in hero-title">
          Master Your Next <span className="text-gradient">Interview</span>
        </h1>
        <p className="animate-fade-in hero-subtitle" style={{ animationDelay: '0.2s' }}>
          Practice with AI-driven mock interviews tailored for top tech companies. 
          Get real-time feedback and detailed performance reports.
        </p>
      </section>

      <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="glass-card config-card">
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Configure Your Session</h2>
          
          <div className="selection-section">
            <p className="selection-label">Select Company</p>
            <div className="selection-grid">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className={`selection-card ${selectedCompany === company.id ? 'active' : ''}`}
                >
                  <div className="card-icon">{company.logo}</div>
                  <div className="card-name">{company.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="selection-section">
            <p className="selection-label">Select Role</p>
            <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`selection-card ${selectedRole === role.id ? 'active' : ''}`}
                >
                  <div className="card-icon">{role.icon}</div>
                  <div className="card-name">{role.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link 
              href={isReady ? `/interview?company=${selectedCompany}&role=${selectedRole}` : "#"} 
              className="btn-primary"
              style={{ 
                paddingLeft: '3rem', 
                paddingRight: '3rem', 
                fontSize: '1.1rem',
                opacity: isReady ? 1 : 0.5,
                pointerEvents: isReady ? 'auto' : 'none'
              }}
            >
              Start Interview
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
