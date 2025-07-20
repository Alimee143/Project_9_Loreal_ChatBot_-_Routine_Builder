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
const simpleChatForm = document.getElementById("chatForm");
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

  // Convert markdown-style links to HTML clickable links for beginners
  // Example: ([prnewswire.com](https://...))
  const linkRegex = /\(\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\)/g;
  let htmlText = text.replace(linkRegex, (match, label, url) => {
    return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
  });

  // Basic markdown formatting for readability
  // Bold: **text**
  htmlText = htmlText.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  htmlText = htmlText.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  // Simple line breaks
  htmlText = htmlText.replace(/\n/g, '<br>');

  // Set HTML so links and formatting are visible
  msgDiv.innerHTML = htmlText;
  chatWindowDiv.appendChild(msgDiv);
  chatWindowDiv.scrollTop = chatWindowDiv.scrollHeight;
}

// Handle form submit
simpleChatForm.addEventListener("submit", async function (e) {
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

/**
 * Helper function to show a popup with product details.
 * Used by both index.html, products.html, and routine-builder.html.
 */
function showProductPopup(product) {
  // Create overlay for popup
  const popupBg = document.createElement('div');
  popupBg.className = 'product-popup-bg';
  popupBg.style.position = 'fixed';
  popupBg.style.top = '0';
  popupBg.style.left = '0';
  popupBg.style.width = '100vw';
  popupBg.style.height = '100vh';
  popupBg.style.background = 'rgba(0,0,0,0.5)';
  popupBg.style.display = 'flex';
  popupBg.style.alignItems = 'center';
  popupBg.style.justifyContent = 'center';
  popupBg.style.zIndex = '9999';

  // Popup box with product info
  const popupBox = document.createElement('div');
  popupBox.className = 'product-popup-box';
  popupBox.style.background = '#fff';
  popupBox.style.padding = '24px';
  popupBox.style.borderRadius = '8px';
  popupBox.style.maxWidth = '350px';
  popupBox.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
  popupBox.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="max-width:100%;border-radius:6px;" />
    <h3 style="margin-top:12px;">${product.name}</h3>
    <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
    <p style="margin-top:8px;">${product.description || 'No description available.'}</p>
    <button id="closeProductPopup" style="margin-top:16px;padding:8px 16px;background:#bfa37c;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
  `;

  popupBg.appendChild(popupBox);
  document.body.appendChild(popupBg);

  // Close popup when clicking close button or outside the box
  document.getElementById('closeProductPopup').onclick = () => {
    document.body.removeChild(popupBg);
  };
  popupBg.onclick = (e) => {
    if (e.target === popupBg) {
      document.body.removeChild(popupBg);
    }
  };
}

/**
 * Helper function to create a product card with banner and popup logic.
 * Returns a DOM element for the card.
 * Used by both index.html and products.html and now routine-builder.html.
 */
function createProductCard(product) {
  // Create product card
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" />
    <h3 style="margin:12px 0 8px 0; font-size:1.1rem;">${product.name}</h3>
    <p style="margin:0 0 8px 0; font-size:0.95rem;">${product.brand}</p>
    <div class="view-details" style="
      display:none;
      position:absolute;
      left:0;
      right:0;
      bottom:1.1rem;
      background:#bfa37c;
      color:#fff;
      font-weight:600;
      padding:0.6rem 0;
      border-radius:0 0 12px 12px;
      font-size:1rem;
      letter-spacing:0.5px;
      text-align:center;
      transition:opacity 0.2s, transform 0.2s;
      cursor:pointer;
      opacity:0.97;
      z-index:2;
    ">Show Description</div>
  `;

  // Show banner on hover
  card.addEventListener('mouseenter', () => {
    card.querySelector('.view-details').style.display = 'block';
  });
  card.addEventListener('mouseleave', () => {
    card.querySelector('.view-details').style.display = 'none';
  });

  // Show popup when card is clicked (anywhere on the card)
  card.onclick = () => {
    showProductPopup(product);
  };

  // Also allow clicking the banner to open the popup
  card.querySelector('.view-details').onclick = (e) => {
    e.stopPropagation();
    showProductPopup(product);
  };

  return card;
}

// Load products from products.json and display them as cards
async function loadProducts() {
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = '<p>Loading products...</p>';

  try {
    const response = await fetch('products.json');
    const data = await response.json();
    const products = data.products;

    productsGrid.innerHTML = '';

    products.forEach(product => {
      // Create product card (same style as home screen)
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';

      // Card HTML
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" />
        <h3 style="margin:12px 0 8px 0; font-size:1.1rem;">${product.name}</h3>
        <!-- Banner overlay, hidden by default -->
        <div class="view-details" style="
          display:none;
          position:absolute;
          top:50%;
          left:0;
          width:100%;
          transform:translateY(-50%);
          background:#bfa37c;
          color:#fff;
          height:38px;
          line-height:33px;
          font-size:1.05em;
          font-weight:600;
          text-align:center;
          border-radius:0 0 8px 8px;
          box-shadow:0 2px 8px rgba(0,0,0,0.08);
          cursor:pointer;
          opacity:0.97;
          z-index:2;
        ">Show description</div>
      `;

      // Show "Show description" banner in the middle on hover
      card.addEventListener('mouseenter', () => {
        card.querySelector('.view-details').style.display = 'block';
      });
      card.addEventListener('mouseleave', () => {
        card.querySelector('.view-details').style.display = 'none';
      });

      // Show popup on click
      card.addEventListener('click', () => {
        showProductPopup(product);
      });

      productsGrid.appendChild(card);
    });
  } catch (error) {
    productsGrid.innerHTML = '<p>Sorry, we could not load the products.</p>';
    console.error(error);
  }
}

// --- Home Products Slider using products.json ---

let homeProducts = []; // Will hold products from products.json
let currentSlide = 0;  // Index of the currently shown product

// Function to show a product in the slider
function showHomeProduct(index) {
  const slider = document.getElementById('homeProductSlider');
  slider.innerHTML = ''; // Clear previous

  // Get product at index
  const product = homeProducts[index];

  // Create card
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" />
    <h3 style="margin:12px 0 8px 0; font-size:1.1rem;">${product.name}</h3>
    <p style="margin:0 0 8px 0; font-size:0.95rem;">${product.brand}</p>
  `;
  slider.appendChild(card);
}

// Load products from products.json for the slider
async function loadHomeSliderProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    homeProducts = data.products || [];

    // Only show slider if products exist
    if (homeProducts.length > 0) {
      showHomeProduct(currentSlide);

      // Add event listeners for buttons
      document.getElementById('prevBtn').onclick = () => {
        currentSlide = (currentSlide - 1 + homeProducts.length) % homeProducts.length;
        showHomeProduct(currentSlide);
      };
      document.getElementById('nextBtn').onclick = () => {
        currentSlide = (currentSlide + 1) % homeProducts.length;
        showHomeProduct(currentSlide);
      };
    }
  } catch (error) {
    // If there's an error, show a message in the slider
    const slider = document.getElementById('homeProductSlider');
    slider.innerHTML = '<p>Sorry, could not load products.</p>';
    console.error(error);
  }
}

// Home page slider logic for beginners
document.addEventListener("DOMContentLoaded", async () => {
  // Get slider DOM elements
  const slider = document.getElementById('homeProductSlider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Only run if slider exists (home page)
  if (!slider || !prevBtn || !nextBtn) return;

  let homeProducts = [];
  let currentSlide = 0;

  // Helper to show one product in the slider
  function showHomeProduct(index) {
    slider.innerHTML = '';
    const product = homeProducts[index];
    if (!product) return;
    // Use the same card style as other pages
    const card = createProductCard(product);
    slider.appendChild(card);
  }

  // Fetch products from products.json
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    homeProducts = data.products || [];
    if (homeProducts.length > 0) {
      showHomeProduct(currentSlide);
      prevBtn.onclick = () => {
        currentSlide = (currentSlide - 1 + homeProducts.length) % homeProducts.length;
        showHomeProduct(currentSlide);
      };
      nextBtn.onclick = () => {
        currentSlide = (currentSlide + 1) % homeProducts.length;
        showHomeProduct(currentSlide);
      };
    } else {
      slider.innerHTML = '<p>No products found.</p>';
    }
  } catch (error) {
    slider.innerHTML = '<p>Sorry, could not load products.</p>';
  }
});

// --- Routine Builder Logic for beginners ---

// Get DOM elements
const productsGrid = document.getElementById('productsGrid');
const selectedList = document.getElementById('selectedList');
const generateRoutineBtn = document.getElementById('generateRoutineBtn');
const clearSelectionsBtn = document.getElementById('clearSelectionsBtn');
const routineOutput = document.getElementById('routineOutput');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Store selected products in localStorage
let selectedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];

// Conversation history for chat
let chatHistory = [
  {
    role: "system",
    content: "You are Lily, a helpful L'Oréal virtual assistant. Only answer questions about the generated routine or L'Oréal beauty topics."
  }
];

// Load products from products.json
async function loadProducts() {
  const response = await fetch('products.json');
  const data = await response.json();
  const products = data.products;
  productsGrid.innerHTML = '';

  products.forEach(product => {
    // Create product card
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p class="product-brand">${product.brand}</p>
      <button class="desc-btn">Show Description</button>
    `;
    // Show description modal
    card.querySelector('.desc-btn').onclick = (e) => {
      e.stopPropagation();
      showDescription(product);
    };
    // Select/unselect product
    card.onclick = () => {
      toggleProduct(product);
    };
    // Highlight if selected
    if (selectedProducts.find(p => p.id === product.id)) {
      card.classList.add('selected');
    }
    productsGrid.appendChild(card);
  });
}

// Show product description modal
function showDescription(product) {
  const modalBg = document.createElement('div');
  modalBg.className = 'modal-bg';

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box';
  modalBox.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p><strong>Brand:</strong> ${product.brand}</p>
    <p>${product.description}</p>
    <button id="closeDescModal">Close</button>
  `;
  modalBg.appendChild(modalBox);
  document.body.appendChild(modalBg);
  document.getElementById('closeDescModal').onclick = () => {
    document.body.removeChild(modalBg);
  };
}

// Toggle product selection
function toggleProduct(product) {
  const idx = selectedProducts.findIndex(p => p.id === product.id);
  if (idx > -1) {
    selectedProducts.splice(idx, 1);
  } else {
    selectedProducts.push(product);
  }
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  updateSelectedList();
  loadProducts();
}

// Update selected products section
function updateSelectedList() {
  selectedList.innerHTML = '';
  selectedProducts.forEach(product => {
    const item = document.createElement('div');
    item.className = 'selected-item';
    item.innerHTML = `
      <span>${product.name}</span>
      <button class="remove-btn" title="Remove">&#10005;</button>
    `;
    item.querySelector('.remove-btn').onclick = () => {
      selectedProducts = selectedProducts.filter(p => p.id !== product.id);
      localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
      updateSelectedList();
      loadProducts();
    };
    selectedList.appendChild(item);
  });
  // Clear routine output if no products are selected
  if (selectedProducts.length === 0 && routineOutput) {
    routineOutput.textContent = '';
  }
}

// Clear all selections
clearSelectionsBtn.onclick = () => {
  selectedProducts = [];
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  updateSelectedList();
  loadProducts();
  // Also clear the routine output
  if (routineOutput) {
    routineOutput.textContent = '';
  }
};

// Generate routine using the same API as the chatbot
generateRoutineBtn.onclick = async () => {
  // Check if any products are selected
  if (selectedProducts.length === 0) {
    routineOutput.textContent = "Please select at least one product.";
    return;
  }
  routineOutput.textContent = "Generating your routine...";

  // Prepare messages for the API (same format as chatbot)
  const messages = [
    {
      role: "system",
      content: "You are Lily, a helpful L'Oréal virtual assistant. Only answer questions about the generated routine or L'Oréal beauty topics."
    },
    {
      role: "user",
      content: `Create a personalized beauty routine using these products:\n${selectedProducts.map(p => `${p.name} (${p.brand}) - ${p.category}: ${p.description}`).join('\n')}`
    }
  ];

  try {
    // Fetch routine from the same API as the chatbot
    const response = await fetch("https://loreal-chatbot.za209.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    // Parse the response
    const data = await response.json();
    let routineText = "";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      routineText = data.choices[0].message.content;
    } else if (data.reply) {
      routineText = data.reply;
    } else {
      routineText = "Sorry, I couldn't generate a routine.";
    }

    // Format the routine text for better readability
    let formatted = routineText
      .replace(/\n\n/g, '<br><br>')
      .replace(/(?:^|\n)[•\-]\s?(.*)/g, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    routineOutput.innerHTML = formatted;

    // Add background to routine section if routine is present
    const routineSection = document.querySelector('.routine-output-section');
    if (routineSection) {
      routineSection.classList.add('has-routine');
    }
  } catch (error) {
    routineOutput.textContent = "Sorry, there was a problem generating your routine.";
  }
};

// Clear all selections
clearSelectionsBtn.onclick = () => {
  selectedProducts = [];
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  updateSelectedList();
  loadProducts();
  // Remove background from routine section
  const routineSection = document.querySelector('.routine-output-section');
  if (routineSection) {
    routineSection.classList.remove('has-routine');
  }
};

// Chatbox logic
function addChatMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg " + sender;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addChatMessage(message, "user");
  chatInput.value = "";
  chatHistory.push({ role: "user", content: message });

  // Send follow-up question to Cloudflare Worker
  try {
    addChatMessage("...", "ai");
    const response = await fetch("https://loreal-chatbot.za209.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });
    // Remove loading message
    const loadingMsg = chatMessages.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatMessages.removeChild(loadingMsg);
    }
    const data = await response.json();
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
    addChatMessage(replyText, "ai");
    chatHistory.push({ role: "assistant", content: replyText });
  } catch (error) {
    const loadingMsg = chatMessages.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "...") {
      chatMessages.removeChild(loadingMsg);
    }
    addChatMessage("Sorry, there was a problem connecting to the chatbot.", "ai");
  }
});

/**
 * Helper for routine builder: create product card with "Show Description" button.
 * Students can use this in the routine builder page.
 */
function createRoutineProductCard(product) {
  // Create product card
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" />
    <h3 style="margin:12px 0 8px 0; font-size:1.1rem;">${product.name}</h3>
    <p style="margin:0 0 8px 0; font-size:0.95rem;">${product.brand}</p>
    <button class="desc-btn">Show Description</button>
  `;

  // Show description popup when button is clicked
  card.querySelector('.desc-btn').onclick = (e) => {
    e.stopPropagation();
    showProductPopup(product);
  };

  return card;
}

// Loads products from products.json and uses createRoutineProductCard for each product
function loadRoutineBuilderProducts() {
  // This function is for the routine builder page only
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return; // Only run if the grid exists
  productsGrid.innerHTML = '<p>Loading products...</p>';

  // Use async/await for beginner-friendly API fetching
  (async () => {
    try {
      const response = await fetch('products.json');
      const data = await response.json();
      const products = data.products;

      productsGrid.innerHTML = '';

      // Use the routine builder card function for each product
      products.forEach(product => {
        const card = createRoutineProductCard(product);
        productsGrid.appendChild(card);
      });
    } catch (error) {
      productsGrid.innerHTML = '<p>Sorry, we could not load the products.</p>';
    }
  })();
}

// Beginner-friendly: Detect RTL language and set direction automatically for all pages
(function() {
  // List of RTL language codes
  const rtlLangs = ['ar', 'he', 'fa', 'ur'];
  // Get browser language
  const lang = (navigator.language || navigator.userLanguage || '').slice(0,2).toLowerCase();
  if (rtlLangs.includes(lang)) {
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.setAttribute('dir', 'ltr');
  }
})();

// Initial load
updateSelectedList();
loadProducts();
loadHomeSliderProducts();
loadRoutineBuilderProducts(); // Add this for the routine builder page
