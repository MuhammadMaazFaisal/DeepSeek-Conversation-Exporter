/************************************************************
 * 1. DETECT DOMAIN & CHOOSE COLLECTION METHOD
 ************************************************************/
function collectConversation() {
  const hostname = window.location.hostname;

  if (hostname.includes("deepseek.com")) {
    return collectDeepSeekConversation();
  } else if (hostname.includes("chatgpt.com")) {
    return collectChatGPTConversation();
  } else {
    console.warn("No matching domain found for conversation extraction.");
    return [];
  }
}

/************************************************************
 * 2. DEEPSEEK CONVERSATION EXTRACTION
 ************************************************************/
function collectDeepSeekConversation() {
  const conversation = [];

  // Try to find the main chat container
  const chatContainer = document.querySelector(".f2eea526");
  if (!chatContainer) {
    console.error("DeepSeek chat container not found.");
    return [];
  }

  // We'll do a stable approach: user messages have .ds-flex, assistant messages have .ds-markdown
  const messageElements = Array.from(chatContainer.querySelectorAll("div"));

  let lastSender = null;
  messageElements.forEach((element) => {
    // Assistant message?
    const assistantContent = element.querySelector(".ds-markdown");
    if (assistantContent) {
      const text = assistantContent.textContent.trim();
      if (text && lastSender !== "assistant") {
        conversation.push({ sender: "assistant", text });
        lastSender = "assistant";
      }
      return;
    }

    // User message?
    const userActionBar = element.querySelector(".ds-flex");
    if (userActionBar) {
      // Clone & remove interactive elements
      const clone = element.cloneNode(true);
      clone.querySelectorAll(".ds-icon-button, .ds-flex").forEach((el) => el.remove());
      const text = clone.textContent.trim();
      if (text && lastSender !== "user") {
        conversation.push({ sender: "user", text });
        lastSender = "user";
      }
    }
  });

  // If first message is assistant, remove it to ensure user starts first (if your logic requires that).
  if (conversation.length && conversation[0].sender === "assistant") {
    conversation.shift();
  }

  return conversation;
}

/************************************************************
 * 3. CHATGPT CONVERSATION EXTRACTION
 ************************************************************/
/*
  Based on the structure:

  - <article data-message-author-role="user"> => user messages
  - <article data-message-author-role="assistant"> => assistant messages
  - The text is generally inside a .markdown for assistant or a div with user text
*/

function collectChatGPTConversation() {
  const conversation = [];

  // Select all <article> elements that represent chat turns
  const chatArticles = document.querySelectorAll("[data-message-author-role]");
  console.log(chatArticles);

  // We'll track the lastSender to avoid duplicates or consecutive messages from same side
  let lastSender = null;

  chatArticles.forEach((article) => {
    const role = article.getAttribute("data-message-author-role");
    // The user text is in a child div or direct text
    const userDiv = article.querySelector("div[class*='bg-token-message-surface']"); 
    // The assistant text is inside the .markdown
    const assistantDiv = article.querySelector(".markdown");

    if (role === "user" && userDiv) {
      const text = userDiv.textContent.trim();
      if (text && lastSender !== "user") {
        conversation.push({ sender: "user", text });
        lastSender = "user";
      }
    } else if (role === "assistant" && assistantDiv) {
      const text = assistantDiv.textContent.trim();
      if (text && lastSender !== "assistant") {
        conversation.push({ sender: "assistant", text });
        lastSender = "assistant";
      }
    }
  });

  // Optionally ensure the first message is user
  if (conversation.length && conversation[0].sender === "assistant") {
    conversation.shift();
  }

  return conversation;
}

/************************************************************
 * 4. CREATE A FLOATING BUTTON + COPY LOGIC
 ************************************************************/
const button = document.createElement("button");
button.textContent = "Copy Chat as JSON";
button.style.position = "fixed";
button.style.bottom = "20px";
button.style.right = "20px";
button.style.padding = "10px 15px";
button.style.zIndex = "9999";
button.style.backgroundColor = "#007bff";
button.style.color = "#fff";
button.style.border = "none";
button.style.borderRadius = "4px";
button.style.cursor = "pointer";
document.body.appendChild(button);

button.addEventListener("click", () => {
  const conversation = collectConversation();
  if (!conversation.length) {
    alert("No conversation found!");
    return;
  }
  const conversationJSON = JSON.stringify(conversation, null, 2);
  navigator.clipboard.writeText(conversationJSON)
    .then(() => alert("Chat conversation copied as JSON!"))
    .catch((err) => alert("Failed to copy conversation: " + err));
});
