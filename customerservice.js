// Create gold particles with enhanced styling

document.addEventListener('DOMContentLoaded', function() {
const particlesContainer = document.getElementById('particles');

// Create 50 particles for a more luxurious effect
for (let i = 0; i < 50; i++) {
 const particle = document.createElement('div');
 particle.classList.add('particle');
 
 // Randomize position and properties
 const posX = Math.random() * 100;
 const posY = Math.random() * 100;
 const size = Math.random() * 3 + 1;
 const opacity = Math.random() * 0.5 + 0.3;
 const animationDuration = Math.random() * 20 + 10;
 
 // Set gold color variations
 const goldHue = Math.floor(Math.random() * 20) + 40; // 40-60 range for gold hues
 const goldSaturation = Math.floor(Math.random() * 20) + 80; // 80-100% saturation
 const goldLightness = Math.floor(Math.random() * 20) + 50; // 50-70% lightness
 
 particle.style.left = posX + 'vw';
 particle.style.top = posY + 'vh';
 particle.style.width = size + 'px';
 particle.style.height = size + 'px';
 particle.style.opacity = opacity;
 particle.style.animationDuration = animationDuration + 's';
 particle.style.animationDelay = Math.random() * 5 + 's';
 particle.style.background = `hsl(${goldHue}, ${goldSaturation}%, ${goldLightness}%)`;
 particle.style.boxShadow = `0 0 ${size * 4}px ${size}px rgba(212, 175, 55, 0.6)`;
 
 particlesContainer.appendChild(particle);
}

// Add a few larger, more prominent particles
for (let i = 0; i < 10; i++) {
 const specialParticle = document.createElement('div');
 specialParticle.classList.add('particle');
 
 const posX = Math.random() * 100;
 const posY = Math.random() * 100;
 const size = Math.random() * 4 + 3; // Larger size
 const animationDuration = Math.random() * 25 + 15; // Slower animation
 
 specialParticle.style.left = posX + 'vw';
 specialParticle.style.top = posY + 'vh';
 specialParticle.style.width = size + 'px';
 specialParticle.style.height = size + 'px';
 specialParticle.style.opacity = 0.7;
 specialParticle.style.animationDuration = animationDuration + 's';
 specialParticle.style.animationDelay = Math.random() * 5 + 's';
 specialParticle.style.background = '#d4af37'; // Pure gold color
 specialParticle.style.boxShadow = `0 0 ${size * 5}px ${size * 2}px rgba(212, 175, 55, 0.8)`;
 
 particlesContainer.appendChild(specialParticle);
}

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const questionChips = document.querySelectorAll('.question-chip');

// Function to add a message to the chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'concierge'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageContent.appendChild(messageText);
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageContent.appendChild(messageTime);
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send message to the API
async function sendMessage(message) {
    try {
        // Show typing indicator
        addTypingIndicator();
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        // Remove typing indicator
        removeTypingIndicator();

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();
        
        // Handle both OpenAI response and fallback response formats
        const responseContent = data.response?.content || data.response || 'I apologize, but I am having trouble processing your request right now.';
        const isFallback = data.response?.isFallback || false;
        
        if (isFallback) {
            addMessage(`⚠️ ${responseContent}`);
        } else {
            addMessage(responseContent);
        }
        
    } catch (error) {
        removeTypingIndicator();
        console.error('Error:', error);
        addMessage('I apologize, but I am having trouble connecting right now. Please try again later.');
    }
}

// Function to add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message concierge';
    typingDiv.id = 'typing-indicator';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(messageContent);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle send button click
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        addMessage(message, true);
        messageInput.value = '';
        sendMessage(message);
    }
});

// Handle enter key press
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            sendMessage(message);
        }
    }
});

// Handle suggested questions
document.addEventListener('DOMContentLoaded', function() {
    const suggestedQuestions = document.querySelectorAll('.suggested-question');
    suggestedQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const questionText = question.textContent;
            addMessage(questionText, true);
            sendMessage(questionText);
        });
    });
});

// Clean up - removed local pattern matching since we now use OpenAI API
});

