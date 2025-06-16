// Initialize chat when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const suggestedQuestions = document.querySelectorAll('.suggested-question');

    let greeted = false; // Track if initial greeting has been shown

    // Enhanced fallback responses with more variety and context
    const fallbackResponses = {
        'greeting': [
            'Welcome to Prestigio Motors Concierge! How may I assist you today?',
            'Hello! Thank you for contacting Prestigio Motors. How can I help you?',
            'Good day! Welcome to Prestigio Motors. What would you like to know?'
        ],
        'hours': [
            'Our showroom is open Monday to Saturday from 9:00 AM to 8:00 PM, and Sundays from 11:00 AM to 6:00 PM.',
            'You can visit us Monday through Saturday, 9 AM to 8 PM, and on Sundays from 11 AM to 6 PM.',
            'We welcome you at our showroom from 9 AM to 8 PM on weekdays and Saturdays, and 11 AM to 6 PM on Sundays.'
        ],
        'contact': [
            'You can reach us at +2 01098613073 or email us at prestegioautomobiles@gmail.com',
            'For immediate assistance, please call +2 01098613073 or email prestegioautomobiles@gmail.com',
            'Feel free to contact us at +2 01098613073 or drop us an email at prestegioautomobiles@gmail.com'
        ],
        'location': [
            'We are located at Sheikh Zayed Showroom in Al Obour City, Egypt.',
            'Our showroom is situated in the heart of Al Obour City at the Sheikh Zayed Showroom.',
            'You can find us at the Sheikh Zayed Showroom in Al Obour City, Egypt.'
        ],
        'services': [
            'We offer luxury vehicle sales, test drives, financing, and maintenance services.',
            'Our services include new and pre-owned luxury vehicle sales, test drives, financing options, and comprehensive maintenance.',
            'At Prestigio Motors, we provide a full range of services from vehicle sales and test drives to financing and maintenance.'
        ],
        'vehicles': [
            'We have a wide selection of luxury vehicles from top brands. Would you like to know about a specific model or make?',
            'Our inventory includes various luxury vehicles. Are you looking for something specific, like a sedan, SUV, or sports car?',
            'We offer an exclusive collection of luxury vehicles. What type of vehicle are you interested in?'
        ],
        'pricing': [
            'Our pricing varies based on the vehicle model and specifications. Could you let me know which model you\'re interested in?',
            'We offer competitive pricing on all our luxury vehicles. For specific pricing, please let me know which model you\'re considering.',
            'Pricing depends on the vehicle and any customizations. Could you specify which model you\'d like information about?'
        ],
        'testdrive': [
            'We\'d be happy to arrange a test drive! Please let us know which vehicle you\'re interested in and your preferred time.',
            'Test drives can be scheduled by calling +2 01098613073. Which model would you like to experience?',
            'To schedule a test drive, please visit our showroom or contact us at +2 01098613073. What vehicle are you interested in?'
        ],
        'default': [
            'Thank you for your message. Our team will get back to you shortly. For immediate assistance, please call us at +2 01098613073.',
            'I appreciate your inquiry. A member of our team will respond soon. For urgent matters, call +2 01098613073.',
            'Thanks for reaching out! We\'ll get back to you as soon as possible. For immediate help, please call +2 01098613073.'
        ]
    };

    // Get a random response from an array of possible responses
    function getRandomResponse(responseType) {
        const responses = fallbackResponses[responseType] || fallbackResponses['default'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Enhanced keyword matching for fallback responses
    function getFallbackResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (/\b(hi|hello|hey|greeting|welcome|good (morning|afternoon|evening))\b/.test(lowerMsg)) {
            return getRandomResponse('greeting');
        } else if (/\b(open|close|hour|time|schedule|when|available)\b/.test(lowerMsg)) {
            return getRandomResponse('hours');
        } else if (/\b(contact|phone|email|reach|call|number)\b/.test(lowerMsg)) {
            return getRandomResponse('contact');
        } else if (/\b(location|address|where|map|directions|find|located)\b/.test(lowerMsg)) {
            return getRandomResponse('location');
        } else if (/\b(service|offer|provide|maintenance|repair|service center)\b/.test(lowerMsg)) {
            return getRandomResponse('services');
        } else if (/\b(car|vehicle|auto|automobile|model|make|inventory|stock|available|showroom)\b/.test(lowerMsg)) {
            return getRandomResponse('vehicles');
        } else if (/\b(price|cost|how much|pricing|budget|afford|payment|finance)\b/.test(lowerMsg)) {
            return getRandomResponse('pricing');
        } else if (/\b(test drive|test-drive|testdrive|drive|try|experience|demo)\b/.test(lowerMsg)) {
            return getRandomResponse('testdrive');
        }
        return getRandomResponse('default');
    }

    // Add message to chat
    function addMessage(message, isUser = false, isFallback = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user' : 'concierge');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageContent.appendChild(messageText);
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.classList.add('message-time');
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messageContent.appendChild(timestamp);
        
        // Add fallback indicator if this is a fallback response
        if (!isUser && isFallback) {
            const fallbackNotice = document.createElement('div');
            fallbackNotice.classList.add('fallback-notice');
            fallbackNotice.textContent = '⚠️ Using fallback response';
            fallbackNotice.style.fontSize = '0.8em';
            fallbackNotice.style.color = '#666';
            fallbackNotice.style.marginTop = '5px';
            messageContent.appendChild(fallbackNotice);
        }
        
        messageElement.appendChild(messageContent);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        removeTypingIndicator(); // Remove any existing indicator first
        
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('typing-indicator');
        typingElement.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // Determine the correct backend URL
    function getBackendUrl() {
        const currentHost = window.location.hostname;
        const currentPort = window.location.port;
        
        // If we're on localhost, try the backend on port 5000
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
            return `http://${currentHost}:5000/api/chatbot/message`;
        }
        
        // Otherwise, use the same host and port as the frontend
        const port = currentPort ? `:${currentPort}` : '';
        return `http://${currentHost}${port}/api/chatbot/message`;
    }

    // Get response from our new Gemini-powered backend API
    async function getAIResponse(userMessage) {
        try {
            const backendUrl = getBackendUrl();
            console.log('Sending request to:', backendUrl);
            console.log('Request payload:', { message: userMessage, pageUrl: window.location.pathname });
            
            // Call our new Gemini-powered chat API endpoint
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    pageUrl: window.location.pathname
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Unable to connect to the chat service'}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            if (!data.success || !data.reply) {
                throw new Error('Invalid response from server');
            }
            
            const aiResponse = data.reply;
            const isGeminiResponse = data.provider === 'gemini';
            
            return { 
                response: aiResponse, 
                isFallback: !isGeminiResponse,
                provider: data.provider || 'unknown'
            };
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            
            // Use fallback response
            const fallbackResponse = getFallbackResponse(userMessage);
            
            return { 
                response: fallbackResponse, 
                isFallback: true,
                provider: 'local_fallback'
            };
        }
    }

    // Handle send message
    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessage(message, true);
        messageInput.value = '';
        sendButton.disabled = true;
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Get AI response
            const result = await getAIResponse(message);
            
            // Remove typing indicator and show response
            removeTypingIndicator();
            addMessage(result.response, false, result.isFallback);
            
            // Log the provider used
            if (result.provider === 'gemini') {
                console.log('✅ Response generated by Gemini AI');
            } else {
                console.log(`⚠️ Using fallback response (${result.provider})`);
            }
            
        } catch (error) {
            console.error('Error handling message:', error);
            removeTypingIndicator();
            addMessage("I'm sorry, I encountered an error. Please try again or contact us directly at +2 01098613073.", false, true);
        } finally {
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    // Send message function for suggested questions
    function sendSuggestedMessage(message) {
        messageInput.value = message;
        handleSendMessage();
    }

    // Event Listeners
    sendButton.addEventListener('click', handleSendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Add click handlers to suggested questions
    suggestedQuestions.forEach(question => {
        question.addEventListener('click', function() {
            sendSuggestedMessage(this.textContent);
        });
    });

    // Make sendSuggestedMessage available globally for onclick handlers
    window.sendSuggestedMessage = sendSuggestedMessage;
    
    // Initial greeting message
    setTimeout(() => {
        if (!greeted) {
            const greeting = "Hey there! I'm Moamen from Prestigio Motors. Great to see you here! What can I help you with today?";
            addMessage(greeting);
            greeted = true;
        }
    }, 500);

    // Focus on input when page loads
    messageInput.focus();
});