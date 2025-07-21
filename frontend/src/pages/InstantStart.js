import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Play,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const InstantStart = () => {
  const navigate = useNavigate();
  const { createAnonymousUser, isRegistered } = useAuth();

  const handleStartLearning = () => {
    if (isRegistered) {
      navigate('/dashboard');
    } else {
      createAnonymousUser('Anonymous Learner');
      navigate('/dashboard');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #fed7aa 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    header: {
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 0'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logoTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    logoSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      textAlign: 'center'
    },
    hero: {
      marginBottom: '4rem'
    },
    heroTitle: {
      fontSize: '4rem',
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: '1.5rem',
      lineHeight: 1.1
    },
    heroHighlight: {
      color: '#ea580c'
    },
    heroDescription: {
      fontSize: '1.5rem',
      color: '#6b7280',
      marginBottom: '3rem',
      maxWidth: '800px',
      margin: '0 auto 3rem',
      lineHeight: 1.6
    },
    startButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1.5rem 3rem',
      background: '#ea580c',
      color: 'white',
      border: 'none',
      borderRadius: '1rem',
      fontSize: '1.25rem',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(234,88,12,0.3)',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem'
    },
    featureCard: {
      background: 'white',
      padding: '2.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    featureIcon: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      color: 'white'
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    featureDescription: {
      fontSize: '1.125rem',
      color: '#6b7280',
      lineHeight: 1.6
    },
    stats: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '3rem',
      marginBottom: '4rem'
    },
    stat: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: '800',
      color: '#ea580c',
      display: 'block',
      lineHeight: 1
    },
    statLabel: {
      fontSize: '1rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    authSection: {
      background: 'white',
      padding: '3rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '4rem'
    },
    authTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    authDescription: {
      fontSize: '1.125rem',
      color: '#6b7280',
      marginBottom: '2rem'
    },
    authButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    authButton: {
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    loginButton: {
      background: 'transparent',
      color: '#6b7280',
      border: '2px solid #e5e7eb'
    },
    signupButton: {
      background: '#ea580c',
      color: 'white',
      boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .start-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(234,88,12,0.4);
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .auth-button:hover {
          transform: translateY(-2px);
        }
        .login-button:hover {
          border-color: #ea580c;
          color: #ea580c;
        }
        .signup-button:hover {
          background: #dc2626;
          box-shadow: 0 8px 20px rgba(234,88,12,0.4);
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem !important; }
          .hero-description { font-size: 1.25rem !important; }
          .main-content { padding: 2rem 1rem !important; }
          .stats { gap: 2rem !important; }
          .auth-buttons { flex-direction: column; }
        }
      `}</style>

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <Brain color="#ea580c" size={32} />
            <div>
              <h1 style={styles.logoTitle}>MindMelt</h1>
              <p style={styles.logoSubtitle}>Think Fast, Learn CS!</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.hero}>
          <h2 style={styles.heroTitle} className="hero-title">
            Master Computer Science Through{' '}
            <span style={styles.heroHighlight}>Smart Questioning</span>
          </h2>
          <p style={styles.heroDescription} className="hero-description">
            Experience a revolutionary way to learn CS concepts through AI-powered questions 
            that adapt to your thinking style and challenge your understanding.
          </p>
          
          <button
            onClick={handleStartLearning}
            style={styles.startButton}
            className="start-button"
          >
            <Play size={24} />
            <span>Start Learning Now</span>
            <ArrowRight size={20} />
          </button>
          
          <p style={{ 
            marginTop: '1rem', 
            fontSize: '1rem', 
            color: '#9ca3af',
            fontWeight: '500'
          }}>
            No signup required • Try it instantly
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon}>
              <Brain size={32} />
            </div>
            <h3 style={styles.featureTitle}>AI-Powered Learning</h3>
            <p style={styles.featureDescription}>
              Our AI asks the right questions at the right time, helping you discover answers 
              through guided thinking rather than memorization.
            </p>
          </div>
          
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon}>
              <Target size={32} />
            </div>
            <h3 style={styles.featureTitle}>Comprehensive CS Topics</h3>
            <p style={styles.featureDescription}>
              From algorithms and data structures to systems design and AI - 
              master all core computer science concepts.
            </p>
          </div>
          
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon}>
              <Clock size={32} />
            </div>
            <h3 style={styles.featureTitle}>Just 8 Minutes Max</h3>
            <p style={styles.featureDescription}>
              We respect your time and attention span. Our focused learning sessions 
              are designed to keep you engaged for just 8 minutes or less.
            </p>
          </div>
        </div>

        <div style={styles.authSection}>
          <h3 style={styles.authTitle}>Want to save your progress?</h3>
          <p style={styles.authDescription}>
            Create a free account to track your learning journey, 
            unlock personalized recommendations, and never lose your progress.
          </p>
          
          <div style={styles.authButtons}>
            <button
              onClick={() => navigate('/login')}
              style={{
                ...styles.authButton,
                ...styles.loginButton
              }}
              className="auth-button login-button"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                ...styles.authButton,
                ...styles.signupButton
              }}
              className="auth-button signup-button"
            >
              <Sparkles size={20} />
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantStart;