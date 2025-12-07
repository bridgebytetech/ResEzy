document.addEventListener('DOMContentLoaded', function() {
    initAIChat();
    initFloatingBot();
});

const AI_CONFIG = {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    apiKey: 'YOUR_GEMINI_API_KEY',
    systemPrompt: `You are Resezy AI Assistant, a helpful customer support bot for Resezy - a Restaurant Management SaaS platform developed by Bridge Byte Tech.

About Resezy:
- Resezy is a complete restaurant management solution
- It offers POS, inventory management, staff management, online ordering, table reservations, and more
- Pricing: Free (৳0), Basic (৳999/month), Premium (৳2,499/month), Enterprise (৳9,999/month)
- Each restaurant gets their own admin panel and customer-facing website
- Supports bKash, Nagad, and SSLCommerz payment gateways
- Developed by Bridge Byte Tech

Key Features:
- Order Management
- Menu/Product Management
- Table Management & Reservations
- Staff Management (Attendance, Leave, Salary)
- Inventory & Stock Management
- Expense Tracking
- Financial Reports
- Customer Reviews
- Promo Codes & Discounts
- Multi-branch support (Enterprise plan)

You should:
- Answer questions about Resezy features, pricing, and capabilities
- Help users understand how to get started
- Be friendly, professional, and helpful
- Keep responses concise but informative
- If you don't know something specific, suggest contacting support@resezy.com`
};

let chatHistory = [];
let isTyping = false;

function initAIChat() {
    const chatContainer = document.querySelector('.ai-chat-wrapper');
    if (!chatContainer) return;
    
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer && messagesContainer.children.length === 0) {
        addWelcomeMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message || isTyping) return;
    
    addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = true;
    
    chatHistory.push({
        role: 'user',
        content: message
    });
    
    showTypingIndicator();
    generateResponse(message);
}

function addWelcomeMessage() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const welcomeHTML = `
        <div class="ai-message assistant">
            <div class="ai-message-avatar">
                <i data-lucide="bot"></i>
            </div>
            <div class="ai-message-content">
                <p>Hello! I'm Resezy AI Assistant. How can I help you today?</p>
                <p>I can answer questions about our restaurant management platform, pricing, features, and help you get started.</p>
                <div class="ai-suggestions">
                    <button class="ai-suggestion-btn" onclick="askQuestion('What features does Resezy offer?')">What features does Resezy offer?</button>
                    <button class="ai-suggestion-btn" onclick="askQuestion('Tell me about pricing plans')">Tell me about pricing plans</button>
                    <button class="ai-suggestion-btn" onclick="askQuestion('How do I get started?')">How do I get started?</button>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.innerHTML = welcomeHTML;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function askQuestion(question) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = question;
    }
    
    const floatingInput = document.getElementById('floatingChatInput');
    if (floatingInput && document.getElementById('floatingChatMessages')) {
        floatingInput.value = question;
        sendFloatingMessage();
        return;
    }
    
    sendMessage();
}

function addMessage(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const suggestions = messagesContainer.querySelector('.ai-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message ' + role;
    
    const avatarIcon = role === 'assistant' ? '<i data-lucide="bot"></i>' : '<i data-lucide="user"></i>';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="ai-message-avatar">${avatarIcon}</div>
        <div class="ai-message-content">
            ${formatMessage(content)}
            <div class="ai-message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    scrollToBottom();
}

function formatMessage(content) {
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    const lines = content.split('\n');
    let formatted = '';
    let inList = false;
    
    lines.forEach(line => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            if (!inList) {
                formatted += '<ul>';
                inList = true;
            }
            formatted += '<li>' + line.trim().substring(2) + '</li>';
        } else {
            if (inList) {
                formatted += '</ul>';
                inList = false;
            }
            if (line.trim()) {
                formatted += '<p>' + line + '</p>';
            }
        }
    });
    
    if (inList) {
        formatted += '</ul>';
    }
    
    return formatted || '<p>' + content + '</p>';
}

function showTypingIndicator() {
    isTyping = true;
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message assistant typing-indicator-wrapper';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="ai-message-avatar"><i data-lucide="bot"></i></div>
        <div class="ai-message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        const input = document.getElementById('chatInput');
        sendBtn.disabled = !(input && input.value.trim());
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    const floatingMessages = document.getElementById('floatingChatMessages');
    if (floatingMessages) {
        floatingMessages.scrollTop = floatingMessages.scrollHeight;
    }
}

async function generateResponse(userMessage) {
    if (AI_CONFIG.apiKey === 'YOUR_GEMINI_API_KEY') {
        setTimeout(function() {
            hideTypingIndicator();
            const response = getOfflineResponse(userMessage);
            addMessage('assistant', response);
            
            chatHistory.push({
                role: 'assistant',
                content: response
            });
        }, 1500);
        return;
    }
    
    try {
        const response = await fetch(AI_CONFIG.apiEndpoint + '?key=' + AI_CONFIG.apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: AI_CONFIG.systemPrompt + '\n\nUser: ' + userMessage
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });
        
        const data = await response.json();
        
        hideTypingIndicator();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage('assistant', aiResponse);
            
            chatHistory.push({
                role: 'assistant',
                content: aiResponse
            });
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        hideTypingIndicator();
        const fallbackResponse = getOfflineResponse(userMessage);
        addMessage('assistant', fallbackResponse);
    }
}

function getOfflineResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('feature') || message.includes('what can') || message.includes('offer')) {
        return "Resezy offers a comprehensive suite of restaurant management features:\n\n- **Order Management** - Handle dine-in, takeaway, and delivery orders\n- **POS & Billing** - Fast and efficient point of sale system\n- **Menu Management** - Easy product and category management\n- **Table Management** - Track tables and reservations\n- **Staff Management** - Attendance, leave, and salary tracking\n- **Inventory Control** - Stock management and alerts\n- **Financial Reports** - Revenue, expenses, and profit analysis\n- **Customer Reviews** - Collect and manage feedback\n- **Promo Codes** - Create discounts and offers\n\nWould you like to know more about any specific feature?";
    }
    
    if (message.includes('price') || message.includes('pricing') || message.includes('cost') || message.includes('plan')) {
        return "We offer flexible pricing plans to suit every restaurant:\n\n- **Free Plan** - ৳0/month: Up to 50 products, 100 orders/month, Basic features\n- **Basic Plan** - ৳999/month: Up to 200 products, Unlimited orders, Staff management\n- **Premium Plan** - ৳2,499/month: Unlimited products, All features included, Priority support\n- **Enterprise Plan** - ৳9,999/month: Multi-branch support, White-label option, Dedicated support\n\nAll plans come with a 14-day free trial!";
    }
    
    if (message.includes('start') || message.includes('sign up') || message.includes('register') || message.includes('begin')) {
        return "Getting started with Resezy is easy!\n\n- **Step 1:** Click on 'Get Started' and create your account\n- **Step 2:** Set up your restaurant profile\n- **Step 3:** Add your menu items\n- **Step 4:** Configure payment methods\n- **Step 5:** Start taking orders!\n\nThe whole setup takes less than 30 minutes. Plus, you get a 14-day free trial to explore all features.\n\nWould you like me to guide you through any specific step?";
    }
    
    if (message.includes('payment') || message.includes('bkash') || message.includes('nagad') || message.includes('pay')) {
        return "Resezy supports multiple payment gateways:\n\n- **bKash** - Mobile banking payments\n- **Nagad** - Digital payment solution\n- **SSLCommerz** - Card payments (Visa, Mastercard)\n- **Cash** - Traditional cash payments\n\nEach restaurant can configure their own payment credentials, and payments go directly to your account. We only charge a monthly subscription fee - no commission on your sales!";
    }
    
    if (message.includes('contact') || message.includes('support') || message.includes('help') || message.includes('reach')) {
        return "You can reach our support team through:\n\n- **Email:** support@resezy.com\n- **Phone:** +880 1XXX-XXXXXX\n- **Live Chat:** Available on our website\n- **Office Hours:** 9 AM - 10 PM (Everyday)\n\nFor Enterprise customers, we offer dedicated 24/7 support.";
    }
    
    if (message.includes('bridge byte') || message.includes('who made') || message.includes('developer') || message.includes('company')) {
        return "Resezy is developed by **Bridge Byte Tech**, a software development company specializing in SaaS solutions.\n\nWe're passionate about helping restaurants streamline their operations with modern, easy-to-use technology.\n\nOur team combines expertise in restaurant operations with cutting-edge software development to create solutions that truly make a difference.";
    }
    
    if (message.includes('inventory') || message.includes('stock')) {
        return "Our Inventory Management system helps you:\n\n- **Track Stock Levels** - Real-time inventory updates\n- **Low Stock Alerts** - Never run out of ingredients\n- **Supplier Management** - Manage vendor information\n- **Purchase Orders** - Create and track orders\n- **Stock Reports** - Analyze usage patterns\n\nThe system automatically updates when orders are placed, giving you accurate stock information at all times.";
    }
    
    if (message.includes('staff') || message.includes('employee') || message.includes('attendance') || message.includes('salary')) {
        return "Resezy includes complete staff management:\n\n- **Attendance Tracking** - Daily check-in/check-out\n- **Leave Management** - Request and approve leaves\n- **Salary Management** - Calculate and track payments\n- **Role-Based Access** - Manager, Kitchen, Cashier, Waiter, Delivery\n- **Performance Reports** - Track staff efficiency\n\nStaff can access their portal through the same platform - no separate app needed!";
    }
    
    if (message.includes('table') || message.includes('reservation') || message.includes('booking')) {
        return "Our Table & Reservation system includes:\n\n- **Table Management** - Visual table layout\n- **Online Reservations** - Customers can book online\n- **Availability Calendar** - Manage time slots\n- **Reservation Reminders** - Automatic notifications\n- **Walk-in Management** - Handle walk-in customers\n\nCustomers can make reservations through your restaurant website!";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return "Hello! Welcome to Resezy. I'm here to help you learn about our restaurant management platform.\n\nYou can ask me about:\n- Features and capabilities\n- Pricing plans\n- How to get started\n- Payment methods\n- And much more!\n\nWhat would you like to know?";
    }
    
    if (message.includes('thank')) {
        return "You're welcome! I'm glad I could help.\n\nIf you have any more questions about Resezy, feel free to ask. You can also:\n\n- Visit our Features page for detailed information\n- Check out our Pricing plans\n- Contact our support team for personalized assistance\n\nHave a great day!";
    }
    
    return "Thanks for your question! I can help you with:\n\n- **Features** - What Resezy offers\n- **Pricing** - Our subscription plans\n- **Getting Started** - How to begin\n- **Payments** - Supported payment methods\n- **Support** - How to contact us\n\nCould you please tell me more about what you'd like to know?";
}

function clearChat() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        chatHistory = [];
        addWelcomeMessage();
    }
}

function exportChat() {
    const dataStr = JSON.stringify(chatHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resezy-chat-history.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function initFloatingBot() {
    if (document.querySelector('.ai-chat-wrapper')) return;
    
    const floatingHTML = `
        <div class="floating-chat-widget" id="floatingChatWidget">
            <button class="floating-chat-button" id="floatingChatBtn" onclick="toggleFloatingChat()">
                <i data-lucide="message-circle" class="chat-icon"></i>
                <i data-lucide="x" class="close-icon"></i>
                <span class="chat-badge">1</span>
            </button>
            <div class="floating-chat-box" id="floatingChatBox">
                <div class="floating-chat-header">
                    <div class="floating-chat-header-info">
                        <div class="floating-chat-avatar">
                            <i data-lucide="bot"></i>
                        </div>
                        <div>
                            <h4>Resezy AI Assistant</h4>
                            <p><span class="online-dot"></span> Online</p>
                        </div>
                    </div>
                    <button class="floating-chat-close" onclick="toggleFloatingChat()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="floating-chat-messages" id="floatingChatMessages">
                    <div class="floating-message bot">
                        <div class="floating-message-avatar"><i data-lucide="bot"></i></div>
                        <div class="floating-message-content">
                            <p>Hi there! I'm Resezy AI Assistant. How can I help you today?</p>
                            <div class="floating-suggestions">
                                <button onclick="floatingAsk('What is Resezy?')">What is Resezy?</button>
                                <button onclick="floatingAsk('Pricing plans')">Pricing plans</button>
                                <button onclick="floatingAsk('Features')">Features</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="floating-chat-input">
                    <input type="text" id="floatingChatInput" placeholder="Type your message..." onkeypress="handleFloatingKeypress(event)">
                    <button onclick="sendFloatingMessage()" id="floatingSendBtn">
                        <i data-lucide="send"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', floatingHTML);
    
    const style = document.createElement('style');
    style.textContent = `
        .floating-chat-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
        }
        .floating-chat-button {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
            position: relative;
        }
        .floating-chat-button:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5);
        }
        .floating-chat-button .close-icon {
            display: none;
        }
        .floating-chat-button.active .chat-icon {
            display: none;
        }
        .floating-chat-button.active .close-icon {
            display: block;
        }
        .floating-chat-button.active .chat-badge {
            display: none;
        }
        .chat-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 22px;
            height: 22px;
            background: #ef4444;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
        }
        .floating-chat-box {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 380px;
            height: 520px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }
        .floating-chat-box.active {
            display: flex;
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .floating-chat-header {
            padding: 20px;
            background: linear-gradient(135deg, #0f172a, #1e3a5f);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .floating-chat-header-info {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .floating-chat-avatar {
            width: 46px;
            height: 46px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .floating-chat-header h4 {
            color: white;
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 4px 0;
        }
        .floating-chat-header p {
            color: rgba(255,255,255,0.7);
            font-size: 13px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .online-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .floating-chat-close {
            background: rgba(255,255,255,0.1);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .floating-chat-close:hover {
            background: rgba(255,255,255,0.2);
        }
        .floating-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
        }
        .floating-message {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .floating-message.user {
            flex-direction: row-reverse;
        }
        .floating-message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .floating-message.bot .floating-message-avatar {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
        }
        .floating-message.user .floating-message-avatar {
            background: #e2e8f0;
            color: #64748b;
        }
        .floating-message-content {
            max-width: 75%;
            padding: 14px 18px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.6;
        }
        .floating-message.bot .floating-message-content {
            background: white;
            color: #334155;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 4px;
        }
        .floating-message.user .floating-message-content {
            background: #3b82f6;
            color: white;
            border-bottom-right-radius: 4px;
        }
        .floating-message-content p {
            margin: 0 0 8px 0;
        }
        .floating-message-content p:last-child {
            margin-bottom: 0;
        }
        .floating-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }
        .floating-suggestions button {
            padding: 8px 14px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 100px;
            font-size: 12px;
            color: #334155;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .floating-suggestions button:hover {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        .floating-chat-input {
            padding: 16px 20px;
            background: white;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 12px;
        }
        .floating-chat-input input {
            flex: 1;
            padding: 14px 18px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
        }
        .floating-chat-input input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .floating-chat-input button {
            width: 48px;
            height: 48px;
            background: #3b82f6;
            border: none;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .floating-chat-input button:hover {
            background: #2563eb;
        }
        .floating-typing {
            display: flex;
            gap: 4px;
            padding: 8px 0;
        }
        .floating-typing span {
            width: 8px;
            height: 8px;
            background: #3b82f6;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite;
        }
        .floating-typing span:nth-child(2) { animation-delay: 0.2s; }
        .floating-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }
        @media (max-width: 480px) {
            .floating-chat-widget {
                bottom: 20px;
                right: 20px;
            }
            .floating-chat-box {
                width: calc(100vw - 40px);
                height: calc(100vh - 150px);
                bottom: 75px;
                right: -10px;
            }
        }
    `;
    document.head.appendChild(style);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleFloatingChat() {
    const btn = document.getElementById('floatingChatBtn');
    const box = document.getElementById('floatingChatBox');
    const badge = document.querySelector('.chat-badge');
    
    if (btn && box) {
        btn.classList.toggle('active');
        box.classList.toggle('active');
        
        if (badge && box.classList.contains('active')) {
            badge.style.display = 'none';
        }
    }
}

function floatingAsk(question) {
    const input = document.getElementById('floatingChatInput');
    if (input) {
        input.value = question;
        sendFloatingMessage();
    }
}

function handleFloatingKeypress(event) {
    if (event.key === 'Enter') {
        sendFloatingMessage();
    }
}

function sendFloatingMessage() {
    const input = document.getElementById('floatingChatInput');
    const messagesContainer = document.getElementById('floatingChatMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    const suggestions = messagesContainer.querySelector('.floating-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
    
    const userMsgHTML = `
        <div class="floating-message user">
            <div class="floating-message-avatar"><i data-lucide="user"></i></div>
            <div class="floating-message-content"><p>${message}</p></div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', userMsgHTML);
    
    input.value = '';
    
    const typingHTML = `
        <div class="floating-message bot" id="floatingTyping">
            <div class="floating-message-avatar"><i data-lucide="bot"></i></div>
            <div class="floating-message-content">
                <div class="floating-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    setTimeout(function() {
        const typing = document.getElementById('floatingTyping');
        if (typing) typing.remove();
        
        const response = getOfflineResponse(message);
        const formattedResponse = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '</p><p>');
        
        const botMsgHTML = `
            <div class="floating-message bot">
                <div class="floating-message-avatar"><i data-lucide="bot"></i></div>
                <div class="floating-message-content"><p>${formattedResponse}</p></div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', botMsgHTML);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
}

window.sendMessage = sendMessage;
window.askQuestion = askQuestion;
window.clearChat = clearChat;
window.exportChat = exportChat;
window.toggleFloatingChat = toggleFloatingChat;
window.floatingAsk = floatingAsk;
window.handleFloatingKeypress = handleFloatingKeypress;
window.sendFloatingMessage = sendFloatingMessage;