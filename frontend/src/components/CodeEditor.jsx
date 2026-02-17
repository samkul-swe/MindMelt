import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Save, Code, AlertCircle } from 'lucide-react';
import Button from './common/Button';
import '../styles/components/code-editor.css';

const CodeEditor = ({ 
  userProjectId, // NEW: Add this
  file, // NEW: Add this
  initialCode = '', 
  language = 'javascript',
  onSubmit,
  onBackToChat, // NEW: Add this
  readOnly = false 
}) => {
  const [code, setCode] = useState(initialCode);
  const [hasChanges, setHasChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issue, setIssue] = useState(null); // NEW: Track issue
  const editorRef = useRef(null);

  // NEW: Update code when initialCode changes
  useEffect(() => {
    setCode(initialCode);
    setHasChanges(false);
  }, [initialCode]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor theme
    monaco.editor.defineTheme('mindmelt-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#FF6B3530',
        'editor.inactiveSelectionBackground': '#FF6B3520'
      }
    });
    
    monaco.editor.setTheme('mindmelt-theme');

    // NEW: Highlight issue line if present
    if (issue && issue.line) {
      editor.revealLineInCenter(issue.line);
      editor.deltaDecorations([], [
        {
          range: new monaco.Range(issue.line, 1, issue.line, 1),
          options: {
            isWholeLine: true,
            className: 'highlighted-error-line',
            glyphMarginClassName: 'error-glyph'
          }
        }
      ]);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    setHasChanges(value !== initialCode);
  };

  const handleReset = () => {
    if (window.confirm('Reset code to original? All changes will be lost.')) {
      setCode(initialCode);
      setHasChanges(false);
      setIssue(null);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setSubmitting(true);

    try {
      // NEW: Submit to backend for review
      const token = localStorage.getItem('mindmelt_token');
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/projects/code/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userProjectId: userProjectId,
            code: code,
            file: file
          })
        }
      );

      const result = await response.json();

      if (result.action === 'fix_issue') {
        // Has issues - stay in editor, show issue
        setIssue(result.issue);
        alert(result.message); // Show AI explanation
      } else if (result.success) {
        // No issues! Back to chat
        if (onSubmit) {
          onSubmit(code);
        }
      }

    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('project-code-draft', code);
    console.log('Code auto-saved');
  };

  return (
    <div className="code-editor-wrapper">
      {/* NEW: Issue Banner */}
      {issue && (
        <div className="issue-banner" style={{
          background: '#ff9800',
          color: 'white',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span><strong>Issue:</strong> {issue.description}</span>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          {/* NEW: Back button */}
          {onBackToChat && (
            <Button
              variant="ghost"
              size="small"
              onClick={onBackToChat}
            >
              ← Back to Chat
            </Button>
          )}
          <Code size={20} />
          <span className="editor-language">{file || language}</span>
          {hasChanges && <span className="unsaved-indicator">• Unsaved changes</span>}
        </div>

        <div className="toolbar-right">
          <Button
            variant="ghost"
            size="small"
            icon={<RotateCcw size={16} />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="small"
            icon={<Save size={16} />}
            onClick={handleSave}
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="editor-container">
        <Editor
          height="500px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly: readOnly,
            theme: 'mindmelt-theme',
            glyphMargin: true // NEW: Enable glyph margin for error indicators
          }}
        />
      </div>

      {/* Submit Area */}
      <div className="editor-footer">
        <div className="footer-hint">
          <p>💡 {issue ? 'Fix the issue above and resubmit' : 'Implement all the TODO comments above. Look for hints in each comment.'}</p>
        </div>
        <Button
          variant="primary"
          size="large"
          icon={<Play size={20} />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : issue ? 'Resubmit Fixed Code' : 'Submit Code for Review'}
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;