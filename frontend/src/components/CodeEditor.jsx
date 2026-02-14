import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Save, Code } from 'lucide-react';
import Button from './common/Button';
import '../styles/components/code-editor.css';

const CodeEditor = ({ 
  initialCode = '', 
  language = 'javascript',
  onSubmit,
  readOnly = false 
}) => {
  const [code, setCode] = useState(initialCode);
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef(null);

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
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    setHasChanges(value !== initialCode);
  };

  const handleReset = () => {
    if (window.confirm('Reset code to original? All changes will be lost.')) {
      setCode(initialCode);
      setHasChanges(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code);
    }
  };

  const handleSave = () => {
    // Auto-save functionality
    localStorage.setItem('project-code-draft', code);
    console.log('Code auto-saved');
  };

  return (
    <div className="code-editor-wrapper">
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <Code size={20} />
          <span className="editor-language">{language}</span>
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
            theme: 'mindmelt-theme'
          }}
        />
      </div>

      {/* Submit Area */}
      <div className="editor-footer">
        <div className="footer-hint">
          <p>💡 Implement all the TODO comments above. Look for hints in each comment.</p>
        </div>
        <Button
          variant="primary"
          size="large"
          icon={<Play size={20} />}
          onClick={handleSubmit}
          disabled={!hasChanges}
        >
          Submit Code for Review
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;