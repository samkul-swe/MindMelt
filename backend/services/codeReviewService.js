/**
 * Code Review Service - Validates code based on phase
 */
class CodeReviewService {
  
  /**
   * Review code during Define phase
   * Only check: syntax, compilation, basic structure
   * NO logic checks
   */
  async reviewDefinePhase(code, language, concept) {
    const issues = [];
    
    // 1. Basic syntax check
    const syntaxIssues = this.checkSyntax(code, language);
    issues.push(...syntaxIssues);
    
    // 2. Compilation check (imports, types)
    const compilationIssues = this.checkCompilation(code, language);
    issues.push(...compilationIssues);
    
    // 3. Concept-specific check
    const conceptIssues = this.checkConcept(code, concept);
    issues.push(...conceptIssues);
    
    return {
      hasIssues: issues.length > 0,
      issues: issues,
      phase: 'define'
    };
  }
  
  /**
   * Review code during Debug phase
   * Check: runtime errors, logic issues (one at a time)
   */
  async reviewDebugPhase(code) {
    // Mock: simulate running code
    const runtimeIssues = this.simulateRuntime(code);
    
    if (runtimeIssues.length > 0) {
      // Return ONLY first issue
      return {
        hasIssues: true,
        issues: [runtimeIssues[0]],
        remainingIssues: runtimeIssues.length - 1,
        phase: 'debug'
      };
    }
    
    return {
      hasIssues: false,
      phase: 'debug'
    };
  }
  
  /**
   * Check basic syntax
   */
  checkSyntax(code, language) {
    const issues = [];
    
    if (language === 'java') {
      const lines = code.split('\n');
      
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        
        // Skip empty lines, comments, braces
        if (!trimmed || 
            trimmed.startsWith('//') || 
            trimmed.startsWith('/*') ||
            trimmed.endsWith('{') || 
            trimmed.endsWith('}')) {
          return;
        }
        
        // Check for missing semicolon
        if (!trimmed.endsWith(';') && 
            !trimmed.includes('class ') &&
            !trimmed.includes('public ') &&
            !trimmed.includes('private ')) {
          issues.push({
            type: 'syntax_error',
            severity: 'error',
            line: idx + 1,
            description: 'Missing semicolon',
            hint: 'Every statement in Java must end with a semicolon (;)'
          });
        }
      });
    }
    
    return issues;
  }
  
  /**
   * Check compilation (imports, types)
   */
  checkCompilation(code, language) {
    const issues = [];
    
    if (language === 'java') {
      // Check for Date without import
      if (code.includes('Date') && !code.includes('import java.util.Date')) {
        issues.push({
          type: 'missing_import',
          severity: 'error',
          line: 0,
          description: 'Missing import for Date class',
          hint: 'When using Date, you need: import java.util.Date;'
        });
      }
      
      // Check for ArrayList without import
      if (code.includes('ArrayList') && !code.includes('import java.util.ArrayList')) {
        issues.push({
          type: 'missing_import',
          severity: 'error',
          line: 0,
          description: 'Missing import for ArrayList class',
          hint: 'When using ArrayList, you need: import java.util.ArrayList;'
        });
      }
      
      // Check for wrong timestamp type
      if (code.match(/int\s+.*time/i) || code.match(/int\s+.*date/i)) {
        const match = code.match(/int\s+(\w*time\w*|\w*date\w*)/i);
        if (match) {
          const lineNum = code.substring(0, code.indexOf(match[0])).split('\n').length;
          issues.push({
            type: 'type_mismatch',
            severity: 'warning',
            line: lineNum,
            description: 'Using int for timestamp - should use Date',
            hint: 'Timestamps should be stored as Date objects, not integers'
          });
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Check concept-specific requirements
   */
  checkConcept(code, concept) {
    const issues = [];
    
    switch (concept) {
      case 'data_model_fields':
        // Check if they defined basic fields
        if (!code.includes('String') && !code.includes('text')) {
          issues.push({
            type: 'missing_field',
            severity: 'warning',
            line: 0,
            description: 'Missing text field for todo',
            hint: 'A todo needs text to describe what the task is'
          });
        }
        break;
        
      case 'data_structures':
        // Check if they use proper collection
        if (!code.includes('ArrayList') && !code.includes('List')) {
          issues.push({
            type: 'missing_structure',
            severity: 'warning',
            line: 0,
            description: 'How will you store multiple todos?',
            hint: 'Consider using ArrayList to store a list of items'
          });
        }
        break;
        
      // Add more concept checks as needed
    }
    
    return issues;
  }
  
  /**
   * Simulate runtime (mock)
   */
  simulateRuntime(code) {
    const issues = [];
    
    // Mock: Check for common runtime errors
    
    // NullPointerException simulation
    if (code.includes('.get(') && !code.includes('if (') && !code.includes('!= null')) {
      issues.push({
        type: 'runtime_error',
        errorType: 'NullPointerException',
        severity: 'error',
        line: this.findLineWithPattern(code, '.get('),
        description: 'App crashed: Trying to access something that doesn\'t exist',
        hint: 'Always check if an object exists before using it'
      });
    }
    
    // IndexOutOfBounds simulation
    if (code.includes('[') && code.includes(']')) {
      issues.push({
        type: 'runtime_error',
        errorType: 'IndexOutOfBoundsException',
        severity: 'error',
        line: this.findLineWithPattern(code, '['),
        description: 'App crashed: Trying to access an item that doesn\'t exist in the list',
        hint: 'Check the size of your list before accessing an index'
      });
    }
    
    return issues;
  }
  
  /**
   * Find line number with pattern
   */
  findLineWithPattern(code, pattern) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return 0;
  }
}

export default new CodeReviewService();