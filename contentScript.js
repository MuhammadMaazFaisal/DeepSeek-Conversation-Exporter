function collectDynamicConversation() {
  const conversation = [];
  let lastSender = null;
  
  const chatContainer = document.querySelector('.f2eea526');
  if (!chatContainer) return [];
  
  const messageElements = Array.from(chatContainer.querySelectorAll('div'));
  
  // Filter and order messages properly
  const validMessages = messageElements.filter(element => {
    const isAssistant = element.querySelector('.ds-markdown');
    const isUser = element.querySelector('.ds-flex');
    return isAssistant || isUser;
  });

  validMessages.forEach(element => {
    // Check assistant first to maintain DOM order priority
    const assistantContent = element.querySelector('.ds-markdown');
    if (assistantContent) {
      const text = assistantContent.textContent.trim();
      if (text && lastSender !== 'assistant') {
        conversation.push({ sender: 'assistant', text });
        lastSender = 'assistant';
      }
      return;
    }

    // Then check user messages
    const userActionBar = element.querySelector('.ds-flex');
    if (userActionBar) {
      const clone = element.cloneNode(true);
      clone.querySelectorAll('.ds-icon-button, .ds-flex').forEach(el => el.remove());
      const text = clone.textContent.trim();
      
      if (text && lastSender !== 'user') {
        conversation.push({ sender: 'user', text });
        lastSender = 'user';
      }
    }
  });

  // Final validation to ensure user starts first
  if (conversation[0]?.sender === 'assistant') {
    conversation.shift();
  }

  return conversation;
}

// Create and style the floating button
const button = document.createElement('button');
Object.assign(button.style, {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  padding: '10px 15px',
  zIndex: '9999',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});
button.textContent = 'Copy Chat as JSON';

// Add click handler
button.addEventListener('click', () => {
  const conversation = collectDynamicConversation();
  const conversationJSON = JSON.stringify(conversation, null, 2);
  
  navigator.clipboard.writeText(conversationJSON)
    .then(() => alert('Chat conversation copied as JSON!'))
    .catch(err => alert('Failed to copy: ' + err));
});

document.body.appendChild(button);