function collectRightChatConversation() {
  const mainChatContainer = document.querySelector('.f2eea526');
  if (!mainChatContainer) {
    console.error("Main chat container with class 'f2eea526' not found.");
    return [];
  }

  // Select both types of message containers
  const messageElements = mainChatContainer.querySelectorAll('.dad65929, .f9bf7997');
  console.log(messageElements);
  const conversation = [];

  messageElements.forEach((msgElem) => {
    // Determine sender based on the container class.
    // If the element has the 'dad65929' class, it's a user message; otherwise, assistant.
    const sender = msgElem.classList.contains('dad65929') ? "user" : "assistant";

    const text = msgElem.textContent.trim();
    if (text) {
      conversation.push({ sender, text });
    }
  });

  return conversation;
}


  
  // Create a floating button that copies the conversation as JSON
  const button = document.createElement('button');
  button.textContent = 'Copy Chat as JSON';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 15px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#007bff';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  document.body.appendChild(button);
  
  button.addEventListener('click', () => {
    const conversation = collectRightChatConversation();
    const conversationJSON = JSON.stringify(conversation, null, 2);
    navigator.clipboard.writeText(conversationJSON)
      .then(() => alert('Chat conversation copied as JSON!'))
      .catch(err => alert('Failed to copy conversation: ' + err));
  });
  