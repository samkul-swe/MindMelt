import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Code, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import '../styles/components/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Brain size={24} />
              <span>AI-Powered Learning</span>
            </div>
            
            <h1 className="hero-title">
              Stop Learning Concepts You Forget.
              <br />
              <span className="gradient-text">Build Confidence Through Discovery.</span>
            </h1>
            
            <p className="hero-description">
              MindMelt validates your resume skills, teaches through Socratic questioning, 
              and builds developer confidence through real-world project learning.
            </p>

            <div className="hero-actions">
              <Button 
                variant="primary" 
                size="large"
                icon={<ArrowRight size={20} />}
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
              
              <Button 
                variant="outline" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Socratic Learning</span>
              </div>
              <div className="stat">
                <span className="stat-number">Real</span>
                <span className="stat-label">Portfolio Projects</span>
              </div>
              <div className="stat">
                <span className="stat-number">Zero</span>
                <span className="stat-label">Boring Tutorials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="value-props">
        <div className="container">
          <h2 className="section-title">How MindMelt Works</h2>
          
          <div className="props-grid">
            <div className="prop-card">
              <div className="prop-icon">
                <Target size={32} />
              </div>
              <h3>Validate Resume Skills</h3>
              <p>
                Upload your resume. We'll test if you actually know what you claim. 
                No more interview anxiety about inflated skills.
              </p>
              <ul className="prop-features">
                <li><CheckCircle size={16} /> Socratic skill validation</li>
                <li><CheckCircle size={16} /> Real-world scenarios</li>
                <li><CheckCircle size={16} /> Honest gap analysis</li>
              </ul>
            </div>

            <div className="prop-card">
              <div className="prop-icon">
                <Code size={32} />
              </div>
              <h3>Build Real Projects</h3>
              <p>
                Learn by building portfolio-worthy projects. Socratic guidance 
                helps you discover solutions, not memorize tutorials.
              </p>
              <ul className="prop-features">
                <li><CheckCircle size={16} /> 5 projects per domain</li>
                <li><CheckCircle size={16} /> Guided debugging</li>
                <li><CheckCircle size={16} /> Downloadable code</li>
              </ul>
            </div>

            <div className="prop-card">
              <div className="prop-icon">
                <Award size={32} />
              </div>
              <h3>Master LeetCode Patterns</h3>
              <p>
                Upload your LeetCode repo. AI analyzes your solutions, identifies 
                weak patterns, and teaches missing concepts systematically.
              </p>
              <ul className="prop-features">
                <li><CheckCircle size={16} /> Optimize existing solutions</li>
                <li><CheckCircle size={16} /> Learn missing patterns</li>
                <li><CheckCircle size={16} /> Interview-ready confidence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Build Real Confidence?</h2>
            <p>Join developers who learn by doing, not watching.</p>
            <Button 
              variant="primary" 
              size="large"
              icon={<Brain size={20} />}
              onClick={() => navigate('/signup')}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Brain size={24} />
              <span>MindMelt</span>
            </div>
            <p>© 2026 MindMelt. Build confidence through discovery.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;