import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, ArrowRight, Brain } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/resume.css';

const ResumeUploadPage = () => {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (uploadMethod === 'file' && selectedFile) {
        // Upload PDF file
        const formData = new FormData();
        formData.append('resume', selectedFile);

        result = await api.uploadResumePDF(formData);
      } else if (uploadMethod === 'text' && resumeText) {
        // Upload text
        result = await api.uploadResumeText(resumeText);
      } else {
        setError('Please provide your resume');
        setLoading(false);
        return;
      }

      if (result.success) {
        // Navigate to role fit page
        navigate('/role-fit', { state: { analysis: result.analysis } });
      } else {
        setError(result.message || 'Failed to process resume');
      }

    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">
      <div className="container">
        {/* Header */}
        <div className="resume-header">
          <Brain size={40} className="header-icon" />
          <h1>Upload Your Resume</h1>
          <p>Let's validate what you really know and find your best career path</p>
        </div>

        {/* Upload Method Toggle */}
        <div className="upload-method-toggle">
          <button
            className={`toggle-btn ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <Upload size={20} />
            Upload PDF
          </button>
          <button
            className={`toggle-btn ${uploadMethod === 'text' ? 'active' : ''}`}
            onClick={() => setUploadMethod('text')}
          >
            <FileText size={20} />
            Paste Text
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="resume-form">
          {uploadMethod === 'file' ? (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="file-selected">
                  <FileText size={48} />
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    className="change-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="dropzone-placeholder">
                  <Upload size={48} />
                  <p className="dropzone-text">
                    {isDragActive
                      ? 'Drop your resume here'
                      : 'Drag & drop your resume PDF here'}
                  </p>
                  <p className="dropzone-hint">or click to browse</p>
                  <p className="dropzone-limit">Max file size: 5MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-input-area">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here...

Example:
John Doe
Full-Stack Developer | 3 years experience

SKILLS:
- JavaScript, React, Node.js
- Python, Django
- PostgreSQL, MongoDB
- AWS, Docker

EXPERIENCE:
Software Engineer at Tech Corp (2021-2024)
- Built e-commerce platform with React and Node.js
..."
                rows={15}
                className="resume-textarea"
              />
              <p className="char-count">
                {resumeText.length} characters (minimum 100 required)
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            icon={<ArrowRight size={20} />}
            className="submit-btn"
            disabled={
              uploadMethod === 'file' 
                ? !selectedFile 
                : resumeText.trim().length < 100
            }
          >
            Analyze Resume
          </Button>
        </form>

        {/* What Happens Next */}
        <div className="info-section">
          <h3>What happens next?</h3>
          <div className="info-steps">
            <div className="info-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>AI Analysis</h4>
                <p>We extract your skills, experience, and projects</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Role Matching</h4>
                <p>See which engineering roles you're ready for</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Learning Path</h4>
                <p>Get a personalized plan to reach your target role</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;