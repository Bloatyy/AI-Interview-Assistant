import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Assistant | Master Your Career",
  description: "Realistic mock interviews with AI-driven evaluation, webcam intelligence, and automated feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-glow"></div>
        <div className="bg-glow-bottom"></div>
        
        <header className="header">
          <div className="premium-container header-inner">
            <div className="logo-container">
              <div className="logo-symbol"></div>
              <span className="logo-text">Antigravity AI</span>
            </div>
            <nav className="nav-links">
              <a href="/" className="nav-link active">Home</a>
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/about" className="nav-link">About</a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="premium-container footer-inner">
            <p>&copy; 2026 AI Interview Assistant. Built for high-performance candidates.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
