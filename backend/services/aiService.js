/**
 * AI Service - Mock AI responses for conversation flow
 */
class AIService {
  
  /**
   * Generate initial greeting for project
   */
  async generateInitialGreeting(projectDetails) {
    return `Welcome! Let's build a ${projectDetails.projectName} together.

Before we start coding, I want to understand your thinking. 

What information should each todo item contain? Think about what you'd need to track for a task.`;
  }
  
  /**
   * Generate Socratic response
   */
  async generateSocraticResponse({ concept, userMessage, conversationHistory, phase }) {
    console.log('🤖 MOCK: Generating Socratic response for', concept);
    
    // Mock responses based on concept
    const responses = {
      'data_model_fields': this.handleDataModelDiscussion(userMessage, conversationHistory),
      'data_structures': this.handleDataStructureDiscussion(userMessage),
      'ui_components': this.handleUIDiscussion(userMessage),
      'event_handlers': this.handleEventDiscussion(userMessage),
      'persistence': this.handlePersistenceDiscussion(userMessage)
    };
    
    return responses[concept] || {
      message: "I see. Tell me more about your thinking.",
      action: null
    };
  }
  
  /**
   * Handle data model discussion
   */
  handleDataModelDiscussion(userMessage, history) {
    const msg = userMessage.toLowerCase();
    
    // Check if they mentioned fields
    if (msg.includes('text') || msg.includes('title') || msg.includes('description')) {
      // They identified text field
      if (msg.includes('time') || msg.includes('date') || msg.includes('end') || msg.includes('deadline')) {
        // They also identified timestamp - good!
        return {
          message: `Great! You've identified the key fields:
- Todo text/title
- End time/deadline

Let's define these in code. I'll open the editor for you.`,
          action: 'open_editor',
          file: 'models/Todo.java',
          template: `import java.util.Date;

public class Todo {
    // Define your fields here
    // Hint: What text does the todo show?
    private String todoText;
    
    // Hint: When does the todo end?
    private int endTime;  // TODO: Is 'int' the right type for a timestamp?
    
    // Constructor
    public Todo(String text, int time) {
        this.todoText = text;
        this.endTime = time;
    }
}`
        };
      } else {
        // They only mentioned text, ask about timestamp
        return {
          message: "Good start with the todo text! What else might you need? Think about timing - when should the todo be done?",
          action: null
        };
      }
    }
    
    // They haven't mentioned key fields yet
    return {
      message: "Think about what makes a task meaningful. If I tell you 'Buy milk', what else would help you remember and complete it?",
      action: null
    };
  }
  
  /**
   * Handle data structure discussion
   */
  handleDataStructureDiscussion(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('array') || msg.includes('list')) {
      return {
        message: `Perfect! ArrayList is ideal for storing multiple todos because the list can grow and shrink dynamically.

Let's create a TodoList class to manage them.`,
        action: 'open_editor',
        file: 'models/TodoList.java',
        template: `import java.util.ArrayList;

public class TodoList {
    // Store all todos here
    // Hint: Use ArrayList<Todo>
    
    // Constructor
    public TodoList() {
        // Initialize your list
    }
    
    // Add a new todo
    public void addTodo(Todo todo) {
        // YOUR CODE HERE
    }
    
    // Get all todos
    public ArrayList<Todo> getAllTodos() {
        // YOUR CODE HERE
    }
}`
      };
    }
    
    return {
      message: "Think about data structures you know. When you have multiple items and the number can change, what's a good way to store them?",
      action: null
    };
  }
  
  /**
   * Handle UI component discussion
   */
  handleUIDiscussion(userMessage) {
    return {
      message: "UI components coming soon in next iteration!",
      action: null
    };
  }
  
  /**
   * Handle event handler discussion
   */
  handleEventDiscussion(userMessage) {
    return {
      message: "Event handlers coming soon!",
      action: null
    };
  }
  
  /**
   * Handle persistence discussion
   */
  handlePersistenceDiscussion(userMessage) {
    return {
      message: "Persistence coming soon!",
      action: null
    };
  }
  
  /**
   * Explain issue to user
   */
  async explainIssue({ issue, code, concept }) {
    console.log('🤖 MOCK: Explaining issue:', issue.type);
    
    if (issue.type === 'type_mismatch') {
      return `I see you defined the timestamp as \`int\`, but there's a better way!

In Android, we use \`java.util.Date\` to represent points in time. An integer can only store numbers, but a Date object knows about days, hours, minutes, and can handle time zones.

Let me show you what needs to change. Look for the line with \`int endTime\` and change it to \`Date endTime\`.`;
    }
    
    if (issue.type === 'missing_import') {
      return `You're using the \`${issue.description.match(/for (\w+) class/)?.[1]}\` class, but Java needs to know where to find it!

Add this line at the top of your file:
\`\`\`
${issue.hint}
\`\`\`

This tells Java to import the class from the standard library.`;
    }
    
    if (issue.type === 'syntax_error') {
      return `Oops! ${issue.description}. 

In Java, every statement must end with a semicolon (;). This tells Java where one instruction ends and the next begins.

Can you find the line missing a semicolon and add it?`;
    }
    
    return `There's an issue: ${issue.description}. ${issue.hint}`;
  }
  
  /**
   * Generate next concept introduction
   */
  async generateConceptIntro({ concept, previousWork }) {
    const intros = {
      'data_structures': `Excellent! You've defined what a Todo looks like.

Now, your app will have many todos. How will you store and manage multiple todos?`,
      
      'ui_components': `Great work on the data layer!

Now let's think about the user interface. What screens or components will users interact with?`,
      
      'event_handlers': `Your UI is taking shape!

Now, when a user taps a button or types something, what should happen? Let's wire up the interactions.`,
      
      'persistence': `Almost done with the basics!

One problem: when the user closes the app, all todos disappear. How can we save them permanently?`
    };
    
    return intros[concept] || "Let's move to the next concept!";
  }
  
  /**
   * Generate debug phase intro
   */
  async generateDebugIntro() {
    return `🎉 Awesome! You've built all the components.

Now let's test your app and see how it behaves. I'm going to run it with a test scenario:

1. Launch app
2. Add a todo: "Buy milk"
3. Add another: "Walk dog"
4. Mark first todo as complete

Let me see what happens...

[Testing... 2 seconds later]

Uh oh! The app crashed when trying to mark a todo as complete.

Let me show you what went wrong.`;
  }
  
  /**
   * Call AI (stub for future real AI)
   */
  async callAI(prompt, options = {}) {
    // Future: real AI call
    // For now: return mock
    return "Mock AI response";
  }
}

export default new AIService();