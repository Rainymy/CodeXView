class AIConnection {
    constructor() {
        this.apiUrl = ""; 
        this.diagramCode = "";
    }
    
    async getChatResponse(parsedCode) {
      try {
        const response = await fetch('http://localhost:5191/o1Chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userMessage: parsedCode })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        
        this.diagramCode = await response.text();
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
}

const AIConnectionInstance = new AIConnection();
module.exports = AIConnectionInstance;
   

    