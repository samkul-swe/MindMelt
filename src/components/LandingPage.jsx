import React from 'react';

const LandingPage = ({ onStartLearning }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        maxWidth: '800px'
      }}>
        {/* Hero Section */}
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            SocraCode
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '30px',
            opacity: 0.9
          }}>
            Learn Computer Science Through Discovery
          </p>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '40px',
            opacity: 0.8,
            lineHeight: '1.6'
          }}>
            No copy-paste learning. No memorization. Just pure discovery.<br/>
            Our AI tutor guides you to understand algorithms through the Socratic method.
          </p>

          <button
            onClick={onStartLearning}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '15px 40px',
              fontSize: '1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
            }}
          >
            Start Learning 🚀
          </button>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🤔</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Socratic Method</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              Learn through questions, not answers. Build understanding step by step.
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🍦</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Melting Ice Cream Timer</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              Take breaks before burnout. Your ice cream melts when it's time to rest!
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧠</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Deep Understanding</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              No copy-paste allowed. Think through problems and build real knowledge.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '40px',
          backdropFilter: 'blur(10px)',
          textAlign: 'left'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>
            How SocraCode Works
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>1️⃣</div>
              <h4>Choose Your Path</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Pick an algorithm and learning style
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>2️⃣</div>
              <h4>Discover Through Questions</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                AI guides you to insights through strategic questioning
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>3️⃣</div>
              <h4>Take Smart Breaks</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Ice cream melts when you need rest - no burnout!
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>4️⃣</div>
              <h4>Build Real Understanding</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Knowledge that sticks because you discovered it yourself
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', opacity: 0.7 }}>
          <p>Built for the future of computer science education 🎓</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;