import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    authContext = {
      signup: async () => { throw new Error('Auth service unavailable'); },
      loading: false,
      error: 'Authentication service is unavailable',
      isRegistered: false
    };
  }

  const { signup, loading, error, isRegistered } = authContext;

  if (isRegistered) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return 'Please enter your email address';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      return 'Please enter a password';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLocalLoading(true);
      console.log('SignupPage: Attempting signup with email:', formData.email);
      
      await signup(formData.email, formData.password, formData.email.split('@')[0]);
      
      console.log('SignupPage: Signup successful, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('SignupPage: Signup error:', error);
      setFormError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #fed7aa 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    contentWrapper: {
      display: 'flex',
      maxWidth: '1200px',
      width: '100%',
      background: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      minHeight: '600px'
    },
    leftSide: {
      flex: 1,
      background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white',
      position: 'relative'
    },
    brandHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    },
    brandTitle: {
      fontSize: '2.5rem',
      fontWeight: '800',
      margin: '0 0 0.25rem 0',
      color: 'white'
    },
    brandSubtitle: {
      fontSize: '1.125rem',
      margin: 0,
      opacity: 0.9
    },
    welcomeText: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
      lineHeight: 1.4
    },
    featureList: {
      marginBottom: '2rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      fontSize: '1.125rem'
    },
    featureIcon: {
      fontSize: '1.25rem'
    },
    tryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      marginTop: '1rem'
    },
    rightSide: {
      flex: 1,
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    formTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    formSubtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      margin: 0
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#ea580c',
      boxShadow: '0 0 0 3px rgba(234,88,12,0.1)'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      background: 'transparent',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      transition: 'color 0.3s ease'
    },
    passwordRequirements: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    errorMessage: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    benefitsSection: {
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    benefitsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem'
    },
    benefitsTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#ea580c',
      margin: 0
    },
    benefitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: '#9a3412'
    },
    submitButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '1rem',
      background: '#ea580c',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '0.5rem'
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    footer: {
      textAlign: 'center',
      marginTop: '2rem',
      padding: '1rem 0',
      borderTop: '1px solid #e5e7eb'
    },
    footerText: {
      color: '#6b7280',
      fontSize: '0.875rem',
      margin: 0
    },
    footerLink: {
      color: '#ea580c',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: 'inherit'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .try-button:hover {
          background: rgba(255,255,255,0.3) !important;
          border-color: rgba(255,255,255,0.5) !important;
        }
        .submit-button:hover {
          background: #dc2626 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234,88,12,0.3);
        }
        .password-toggle:hover {
          color: #ea580c !important;
        }
        .footer-link:hover {
          color: #dc2626 !important;
        }
        @media (max-width: 768px) {
          .content-wrapper {
            flex-direction: column !important;
            max-width: 100% !important;
            margin: 1rem !important;
          }
          .left-side {
            padding: 2rem 2rem 1rem !important;
            text-align: center;
          }
          .right-side {
            padding: 2rem !important;
          }
          .brand-title {
            font-size: 2rem !important;
          }
          .benefits-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.contentWrapper} className="content-wrapper">
        <div style={styles.leftSide} className="left-side">
          <div style={styles.brandHeader}>
            <Brain size={40} />
            <div>
              <h1 style={styles.brandTitle} className="brand-title">MindMelt</h1>
              <p style={styles.brandSubtitle}>Think Fast, Learn CS!</p>
            </div>
          </div>
          
          <h2 style={styles.welcomeText}>
            Join thousands of learners mastering CS! 🚀
          </h2>
          
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📊</span>
              <span>Track your learning progress over time</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🎯</span>
              <span>Get personalized learning paths</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🏆</span>
              <span>Earn achievements and badges</span>
            </div>
          </div>
          
          <div>
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '0.875rem', 
              opacity: 0.8 
            }}>
              Want to try it first?
            </p>
            <button
              onClick={() => navigate('/start')}
              style={styles.tryButton}
              className="try-button"
            >
              <Sparkles size={16} />
              <span>Try Without Signing Up</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div style={styles.rightSide} className="right-side">
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Your Account</h2>
            <p style={styles.formSubtitle}>Start your CS learning journey today</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {(formError || error) && (
              <div style={styles.errorMessage}>
                <span>⚠️</span>
                <span>{formError || error}</span>
              </div>
            )}

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                <Mail size={16} />
                Email Address
              </label>
              <div style={styles.inputContainer}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  style={styles.input}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                <Lock size={16} />
                Password
              </label>
              <div style={styles.inputContainer}>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a secure password"
                    style={{
                      ...styles.input,
                      paddingRight: '3rem'
                    }}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={styles.passwordRequirements}>
                  Password must be at least 6 characters long
                </div>
              </div>
            </div>

            <div style={styles.benefitsSection}>
              <div style={styles.benefitsHeader}>
                <Star size={16} color="#ea580c" />
                <h4 style={styles.benefitsTitle}>What you'll get:</h4>
              </div>
              <div style={styles.benefitsGrid}>
                <div style={styles.benefitItem}>
                  <div>📊</div>
                  <span>Progress tracking</span>
                </div>
                <div style={styles.benefitItem}>
                  <div>🎯</div>
                  <span>Personalized paths</span>
                </div>
                <div style={styles.benefitItem}>
                  <div>🏆</div>
                  <span>Achievement badges</span>
                </div>
                <div style={styles.benefitItem}>
                  <div>📈</div>
                  <span>Learning analytics</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(isLoading ? styles.submitButtonDisabled : {})
              }}
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Create My Account</span>
                </>
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                style={styles.footerLink}
                className="footer-link"
                disabled={isLoading}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;