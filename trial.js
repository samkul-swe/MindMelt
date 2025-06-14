// Using fetch API (modern approach)
async function makeGMIRequest() {
  try {
    const response = await fetch('https://api.gmi-serving.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjY4ZGNiLTc2MjYtNDU1YS04MTJlLWNjZWQ0NGM1MmFmMSIsInR5cGUiOiJpZV9tb2RlbCJ9.wSR0pMUfjAfTijf8jJSaiec1FutdKCcCJq6RlJo62uM', // Replace <token> with your actual token
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-Prover-V2-671B",
        messages: [
          {
            role: "user",
            content: "How much time does a sloth sleep?"
          }
        ],
        max_tokens: 2000,
        temperature: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response:', data.choices[0].message.content);
    
    return data;
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
}

// Call the function
makeGMIRequest();