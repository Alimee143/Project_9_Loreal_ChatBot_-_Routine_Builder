// --- Chatbot Floating Icon and Window Logic ---

// Get DOM elements
const chatbotIcon = document.getElementById("chatbot-icon");
const chatbotWindow = document.getElementById("chatbot-window");
const closeBtn = document.getElementById("close-btn");
const chatbotBody = chatbotWindow.querySelector(".chatbot-body");

// Show chatbot window when icon is clicked
chatbotIcon.addEventListener("click", () => {
  chatbotWindow.classList.add("active");
  chatbotBody.style.display = "flex";
});

// Close chatbot window
closeBtn.addEventListener("click", () => {
  chatbotWindow.classList.remove("active");
  chatbotBody.style.display = "flex";
});

// --- Simple Chatbot Logic ---
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindowDiv = document.getElementById("chatWindow");

// Conversation history for the chatbot
let messages = [
  {
    role: "system",
    content: `Your name is Lily, you are a helpful and knowledgeable L'Oréal virtual assistant designed to answer
     customers' questions about L'Oréal products and any other related inquiries.\n\nProvide accurate
     , brand-aligned, and helpful responses to customer questions. Address the full range of topics, 
     including product recommendations, usage instructions, ingredients, availability, shade matching, 
     skincare advice, haircare help, promotional information, general beauty queries, and support for 
     common issues. When necessary, use official L'Oréal sources and disclaimers if you are unsure about 
     medical or sensitive advice—direct users to consult with professionals if appropriate.\n\nMaintain a 
     friendly, professional, and supportive tone at all times.\n\n# Steps\n- Read and understand the customer’s
      question.\n- If the question is about a product, provide relevant details: product features, benefits, usage, 
      price, and availability.\n- For questions outside products (e.g., brand info, policies, order support),
       answer clearly or defer to official channels when required.\n- If you do not have certainty about safety,
        allergies, or medical advice, advise the customer to consult with a qualified professional.\n- 
        Be proactive in anticipating customer needs, suggesting helpful options, and asking if they want to 
        know more.\n\n# Output Format\n\nRespond in a friendly and informative paragraph, tailored to the 
        customer’s query. Include bullet points if useful. Responses should be concise (2–5 sentences/bullets), 
        factual, and never include speculative or misleading information.
        \n\n# Examples\n\n**Example 1:**\nCustomer: "Can you recommend a moisturizer for oily skin from L'Oréal?"
        \nResponse:  \nAbsolutely! For oily skin, I recommend the L'Oréal Hydra Genius Daily Liquid Care - 
        Normal/Oily Skin.  \n- Lightweight and oil-free formula  \n- Provides hydration without clogging pores  
        \n- Use morning and night for best results  \nWould you like more information on where to purchase?
        \n\n**Example 2:**\nCustomer: "Does your shampoo contain sulfates?"\nResponse:  \nSome L'Oréal shampoos 
        do contain sulfates, while others are sulfate-free. Let me know the specific product you’re interested in, 
        and I can share the ingredient details. For sensitive scalps, the EverPure Sulfate-Free 
        line is a gentle option.\n\n# Notes\n\n- Never provide medical advice; always suggest consulting a 
        healthcare professional if the question relates to allergies, reactions, or sensitive health matters.
        n- Always remain positive and promote L'Oréal products accurately.\n- If you cannot answer, 
        direct the customer to official L'Oréal support channels.`,
  },
];

// Helper to add a message to the chat window
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg " + sender;
  msgDiv.textContent = text;
  chatWindowDiv.appendChild(msgDiv);
  chatWindowDiv.scrollTop = chatWindowDiv.scrollHeight;
}

// Handle form submit
chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage(message, "user");
  userInput.value = "";

  // Add user message to conversation history
  messages.push({ role: "user", content: message });

  // Fetch reply from Cloudflare Worker API
  try {
    // Show a loading message while waiting for the API
    addMessage("...", "ai");
    const response = await fetch("https://loreal-chatbot.za209.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    // Remove the loading message
    const loadingMsg = chatWindowDiv.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatWindowDiv.removeChild(loadingMsg);
    }
    if (!response.ok) {
      addMessage("Sorry, there was a problem. Please try again later.", "ai");
      return;
    }
    const data = await response.json();
    // Try to get the reply from OpenAI's response structure (choices[0].message.content)
    let replyText = "";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      replyText = data.choices[0].message.content;
    } else if (data.reply) {
      replyText = data.reply;
    } else {
      replyText = "Sorry, I didn't understand that.";
    }
    addMessage(replyText, "ai");
    // Add assistant reply to conversation history
    messages.push({ role: "assistant", content: replyText });
  } catch (error) {
    // Remove the loading message if error
    const loadingMsg = chatWindowDiv.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatWindowDiv.removeChild(loadingMsg);
    }
    addMessage("Sorry, there was a problem connecting to the chatbot.", "ai");
  }
});
