// Order tracking state
let orderStatus = {
    orderId: null,
    status: 'processing',
    currentLocation: null,
    estimatedTime: null,
    deliveryPartner: null,
    steps: [
        { id: 'confirmed', label: 'Order Confirmed', time: null, completed: false },
        { id: 'picked_up', label: 'Order Picked Up', time: null, completed: false },
        { id: 'on_the_way', label: 'On the way', time: null, completed: false },
        { id: 'delivered', label: 'Delivered', time: null, completed: false }
    ],
    chatHistory: []
};

// Initialize tracking
document.addEventListener('DOMContentLoaded', () => {
    // Get order details from app state
    const currentOrder = MediQuickApp.state.currentOrder;
    if (!currentOrder) {
        window.location.href = 'dashboard.html';
        return;
    }

    orderStatus = { ...orderStatus, ...currentOrder };
    initializeTracking();
});

// Initialize tracking UI and updates
function initializeTracking() {
    updateTrackingUI();
    startLocationUpdates();
    setupChatHandlers();
    setupHelpHandlers();
}

// Update tracking UI
function updateTrackingUI() {
    // Update status badge
    const statusBadge = document.querySelector('.status-badge');
    statusBadge.textContent = formatStatus(orderStatus.status);
    statusBadge.className = `status-badge ${orderStatus.status}`;

    // Update estimated time
    const timeDisplay = document.querySelector('.time');
    timeDisplay.textContent = orderStatus.estimatedTime ? `${orderStatus.estimatedTime}mins` : '--';

    // Update tracking steps
    const stepsContainer = document.querySelector('.tracking-steps');
    stepsContainer.innerHTML = orderStatus.steps.map(step => `
        <div class="tracking-step ${step.completed ? 'completed' : ''} ${step.id === orderStatus.status ? 'active' : ''}">
            <h4>${step.label}</h4>
            <p class="time">${step.time || '--'}</p>
            ${step.id === 'on_the_way' && orderStatus.currentLocation ? 
                `<p class="location">${orderStatus.currentLocation}</p>` : ''}
        </div>
    `).join('');

    // Update delivery partner info
    if (orderStatus.deliveryPartner) {
        const partnerInfo = document.querySelector('.partner-info');
        partnerInfo.innerHTML = `
            <img src="${orderStatus.deliveryPartner.image}" alt="Delivery Partner" class="partner-image">
            <div class="partner-details">
                <h4>Your Delivery Partner</h4>
                <p>${orderStatus.deliveryPartner.name}</p>
            </div>
        `;
    }
}

// Start location updates
function startLocationUpdates() {
    // Simulate real-time location updates
    const locations = [
        'Pharmacy - Packing your order',
        'Order picked up',
        'Crossing Main Street',
        'Near City Hospital',
        'Approaching your location',
        'Outside your building'
    ];
    
    let currentIndex = 0;
    const updateInterval = setInterval(() => {
        if (currentIndex < locations.length) {
            orderStatus.currentLocation = locations[currentIndex];
            
            if (currentIndex === 1) {
                updateOrderStatus('picked_up');
            } else if (currentIndex === 2) {
                updateOrderStatus('on_the_way');
            } else if (currentIndex === locations.length - 1) {
                updateOrderStatus('delivered');
                clearInterval(updateInterval);
            }
            
            updateTrackingUI();
            currentIndex++;
        }
    }, 15000); // Update every 15 seconds
}

// Update order status
function updateOrderStatus(status) {
    orderStatus.status = status;
    const step = orderStatus.steps.find(s => s.id === status);
    if (step) {
        step.completed = true;
        step.time = new Date().toLocaleTimeString();
    }
    
    // Update previous steps
    let shouldComplete = true;
    orderStatus.steps.forEach(step => {
        if (shouldComplete) {
            step.completed = true;
            if (!step.time) {
                step.time = new Date().toLocaleTimeString();
            }
        }
        if (step.id === status) {
            shouldComplete = false;
        }
    });

    // Update app state
    MediQuickApp.state.currentOrder = orderStatus;
    MediQuickApp.saveState();
}

// Set up chat functionality
function setupChatHandlers() {
    const chatButton = document.querySelector('.contact-button');
    chatButton.addEventListener('click', openChat);
}

// Open chat interface
function openChat() {
    const chatOverlay = document.createElement('div');
    chatOverlay.className = 'chat-overlay';
    chatOverlay.innerHTML = `
        <div class="chat-header">
            <h3>Chat with ${orderStatus.deliveryPartner?.name || 'Delivery Partner'}</h3>
            <button class="close-chat">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <input type="text" placeholder="Type your message...">
            <button class="send-message">
                <i class="material-icons">send</i>
            </button>
        </div>
    `;
    
    document.body.appendChild(chatOverlay);
    setupChatListeners(chatOverlay);
    loadChatHistory(chatOverlay);
}

// Set up chat event listeners
function setupChatListeners(chatOverlay) {
    const closeButton = chatOverlay.querySelector('.close-chat');
    const input = chatOverlay.querySelector('input');
    const sendButton = chatOverlay.querySelector('.send-message');

    closeButton.addEventListener('click', () => chatOverlay.remove());
    
    const sendMessage = () => {
        const message = input.value.trim();
        if (message) {
            addChatMessage('user', message);
            input.value = '';
            
            // Simulate reply after 1 second
            setTimeout(() => {
                addChatMessage('partner', 'I\'ll be there soon!');
            }, 1000);
        }
    };

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Add message to chat
function addChatMessage(sender, text) {
    const message = {
        sender,
        text,
        timestamp: new Date().toISOString()
    };
    
    orderStatus.chatHistory.push(message);
    MediQuickApp.state.currentOrder = orderStatus;
    MediQuickApp.saveState();
    
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.innerHTML = `
            <p>${text}</p>
            <span class="time">${formatTime(message.timestamp)}</span>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Load chat history
function loadChatHistory(chatOverlay) {
    const chatMessages = chatOverlay.querySelector('.chat-messages');
    orderStatus.chatHistory.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}`;
        messageElement.innerHTML = `
            <p>${message.text}</p>
            <span class="time">${formatTime(message.timestamp)}</span>
        `;
        chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper functions
function formatStatus(status) {
    return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Set up help functionality
function setupHelpHandlers() {
    const helpButton = document.querySelector('.secondary-button');
    helpButton.addEventListener('click', openHelpModal);
}

// Open help modal
function openHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>How can we help you?</h3>
            <div class="help-options">
                <button onclick="handleHelpOption('order')">Order Issues</button>
                <button onclick="handleHelpOption('delivery')">Delivery Partner</button>
                <button onclick="handleHelpOption('medicine')">Medicine Related</button>
                <button onclick="handleHelpOption('payment')">Payment Issues</button>
            </div>
            <button class="close-modal" onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Handle help option selection
function handleHelpOption(type) {
    const supportNumber = '+1-800-MEDIQUICK';
    showNotification(`Connecting you to ${type} support... Please call ${supportNumber}`);
    document.querySelector('.modal').remove();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 