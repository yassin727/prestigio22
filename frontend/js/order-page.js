// Order Page JavaScript
let orderData = {};
let currentOrderId = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    // Load order data from localStorage
    const storedOrderData = localStorage.getItem('orderData');
    if (storedOrderData) {
        orderData = JSON.parse(storedOrderData);
        displayOrderSummary();
    } else {
        // Redirect back if no order data
        window.location.href = 'pages/regularcars.html';
    }
}

function displayOrderSummary() {
    // Display car details
    document.getElementById('orderCarImage').src = orderData.car.image;
    document.getElementById('orderCarName').textContent = orderData.car.name;
    document.getElementById('orderCarBrand').textContent = orderData.car.brand;
    
    // Update page title and headers based on transaction type
    const transactionType = orderData.transactionType || 'buy';
    const isRental = transactionType === 'rent';
    
    // Update page title
    document.title = isRental ? 'Complete Rental Order - Prestigio' : 'Complete Purchase Order - Prestigio';
    
    // Update header text
    const orderHeader = document.querySelector('.order-header h1');
    if (orderHeader) {
        orderHeader.textContent = isRental ? 'Complete Your Rental Order' : 'Complete Your Purchase Order';
    }
    
    // Update submit button text
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) {
        btnText.textContent = isRental ? 'Confirm Rental Order' : 'Confirm Purchase Order';
    }
    
    // Display pricing based on transaction type
    if (isRental) {
        // Display rental-specific pricing
        document.getElementById('orderBasePrice').textContent = `$${orderData.pricing.basePrice}/day`;
        
        // Display rental details
        const rentalDetails = document.getElementById('rentalDetails');
        if (rentalDetails && orderData.rental) {
            rentalDetails.style.display = 'block';
            document.getElementById('rentalDuration').textContent = `${orderData.rental.duration} ${orderData.rental.duration === 1 ? 'Day' : 'Days'}`;
            document.getElementById('rentalPickup').textContent = new Date(orderData.rental.pickupDate).toLocaleDateString();
            document.getElementById('rentalReturn').textContent = new Date(orderData.rental.returnDate).toLocaleDateString();
        }
    } else {
        // Display purchase pricing
        document.getElementById('orderBasePrice').textContent = `$${orderData.pricing.basePrice.toLocaleString()}`;
        
        // Hide rental details if they exist
        const rentalDetails = document.getElementById('rentalDetails');
        if (rentalDetails) {
            rentalDetails.style.display = 'none';
        }
    }
    
    // Display customizations
    const customizationsContainer = document.getElementById('orderCustomizations');
    customizationsContainer.innerHTML = '';
    
    Object.keys(orderData.customizations).forEach(category => {
        const customization = orderData.customizations[category];
        if (customization && customization.price > 0) {
            const customizationItem = document.createElement('div');
            customizationItem.className = 'price-item';
            
            if (isRental) {
                // For rentals, show daily customization cost
                const dailyCost = Math.round(customization.price / 30);
                customizationItem.innerHTML = `
                    <span>${customization.name}:</span>
                    <span>+$${dailyCost}/day</span>
                `;
            } else {
                customizationItem.innerHTML = `
                    <span>${customization.name}:</span>
                    <span>+$${customization.price.toLocaleString()}</span>
                `;
            }
            customizationsContainer.appendChild(customizationItem);
        }
    });
    
    // Display total
    const totalPrice = orderData.pricing.totalPrice || orderData.pricing.finalTotal;
    document.getElementById('orderTotal').textContent = `$${totalPrice.toLocaleString()}`;
}

function setupEventListeners() {
    // Payment method selection
    const paymentMethodSelect = document.getElementById('paymentMethod');
    paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);
    
    // Card number formatting and type detection
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', handleCardNumberInput);
    }
    
    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', handleExpiryDateInput);
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', handleCvvInput);
    }
    
    // Form submission
    const purchaseForm = document.getElementById('purchaseForm');
    purchaseForm.addEventListener('submit', handleFormSubmission);
}

function handlePaymentMethodChange(event) {
    const paymentMethod = event.target.value;
    const paymentDetails = document.getElementById('paymentDetails');
    
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
        paymentDetails.style.display = 'block';
        makePaymentFieldsRequired(true);
    } else {
        paymentDetails.style.display = 'none';
        makePaymentFieldsRequired(false);
    }
}

function makePaymentFieldsRequired(required) {
    const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.required = required;
        }
    });
}

function handleCardNumberInput(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format with spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    if (value.length > 19) {
        value = value.substring(0, 19);
    }
    
    event.target.value = value;
    
    // Detect and display card type
    const cardType = detectCardType(value.replace(/\s/g, ''));
    displayCardType(cardType);
}

function detectCardType(cardNumber) {
    const cardTypes = {
        visa: /^4/,
        mastercard: /^5[1-5]|^2[2-7]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/,
        diners: /^3[0689]/,
        jcb: /^35/
    };
    
    for (const [type, pattern] of Object.entries(cardTypes)) {
        if (pattern.test(cardNumber)) {
            return type;
        }
    }
    
    return 'unknown';
}

function displayCardType(cardType) {
    // Remove existing card type indicator
    const existingIndicator = document.querySelector('.card-type-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (cardType !== 'unknown') {
        const cardNumberInput = document.getElementById('cardNumber');
        const indicator = document.createElement('div');
        indicator.className = 'card-type-indicator';
        indicator.innerHTML = getCardTypeIcon(cardType);
        
        // Insert after card number input
        cardNumberInput.parentNode.appendChild(indicator);
    }
}

function getCardTypeIcon(cardType) {
    const icons = {
        visa: '<span class="card-icon visa">VISA</span>',
        mastercard: '<span class="card-icon mastercard">MC</span>',
        amex: '<span class="card-icon amex">AMEX</span>',
        discover: '<span class="card-icon discover">DISC</span>',
        diners: '<span class="card-icon diners">DINERS</span>',
        jcb: '<span class="card-icon jcb">JCB</span>'
    };
    
    return icons[cardType] || '';
}

function handleExpiryDateInput(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as MM/YY
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    event.target.value = value;
}

function handleCvvInput(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 4 digits (for AMEX) or 3 digits (for others)
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const isAmex = detectCardType(cardNumber) === 'amex';
    const maxLength = isAmex ? 4 : 3;
    
    if (value.length > maxLength) {
        value = value.substring(0, maxLength);
    }
    
    event.target.value = value;
}

async function handleFormSubmission(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(event.target);
        const customerData = Object.fromEntries(formData.entries());
        
        // Prepare order data for backend
        const completeOrderData = {
            car: orderData.car,
            customizations: orderData.customizations,
            pricing: orderData.pricing,
            transactionType: orderData.transactionType || 'buy',
            ...(orderData.rental && { rental: orderData.rental }),
            customer: {
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                email: customerData.email,
                phone: customerData.phone,
                address: {
                    street: customerData.address,
                    city: customerData.city,
                    state: customerData.state,
                    zipCode: customerData.zipCode
                }
            },
            payment: {
                method: customerData.paymentMethod,
                ...(customerData.paymentMethod === 'credit-card' || customerData.paymentMethod === 'debit-card' ? {
                    cardLastFour: customerData.cardNumber.replace(/\s/g, '').slice(-4),
                    cardType: detectCardType(customerData.cardNumber.replace(/\s/g, ''))
                } : {})
            },
            specialRequests: customerData.specialRequests || '',
            emailUpdates: customerData.emailUpdates === 'on',
            status: 'confirmed',
            orderDate: new Date().toISOString()
        };
        
        // Submit order to backend
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(completeOrderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit order');
        }
        
        const result = await response.json();
        currentOrderId = result.orderId;
        
        // Show success modal
        showSuccessModal(result.orderId, customerData.email);
        
        // Clear stored order data
        localStorage.removeItem('orderData');
        
    } catch (error) {
        console.error('Order submission failed:', error);
        showErrorMessage('Failed to submit order. Please try again.');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showSuccessModal(orderId, email) {
    const modal = document.getElementById('successModal');
    document.getElementById('confirmationOrderId').textContent = orderId;
    document.getElementById('confirmationEmail').textContent = email;
    
    // Update modal content based on transaction type
    const modalContent = modal.querySelector('.modal-content');
    const isRental = orderData.transactionType === 'rent';
    
    if (isRental) {
        // Update title and message for rental
        modalContent.querySelector('h2').textContent = 'Rental Confirmed!';
        modalContent.querySelector('p').textContent = 'Thank you for your rental. Your booking has been successfully confirmed.';
        
        // Update modal actions for rental
        const modalActions = modalContent.querySelector('.modal-actions');
        modalActions.innerHTML = `
            <button onclick="logoutToHome()" class="btn-primary">
                <i class="fas fa-home"></i> Return to Home
            </button>
            <button onclick="viewOrderDetails()" class="btn-secondary">View Rental Details</button>
        `;
    } else {
        // Keep original content for purchases
        modalContent.querySelector('h2').textContent = 'Order Confirmed!';
        modalContent.querySelector('p').textContent = 'Thank you for your purchase. Your order has been successfully placed.';
        
        const modalActions = modalContent.querySelector('.modal-actions');
        modalActions.innerHTML = `
            <button onclick="goToHomepage()" class="btn-primary">Continue Shopping</button>
            <button onclick="viewOrderDetails()" class="btn-secondary">View Order Details</button>
        `;
    }
    
        modal.style.display = 'flex';
        
    // Add modal close functionality
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showErrorMessage(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-message">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function goToHomepage() {
    window.location.href = 'index.html';
}

function logoutToHome() {
    // Clear any stored data
    localStorage.removeItem('purchaseData');
    localStorage.removeItem('orderData');
    localStorage.removeItem('userSession');
    localStorage.removeItem('customizationData');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

function viewOrderDetails() {
    if (currentOrderId) {
        // In a real app, this would go to an order details page
        const isRental = orderData && orderData.transactionType === 'rent';
        const message = isRental 
            ? `Rental ID: ${currentOrderId}\nYour rental has been confirmed and you will receive updates via email.`
            : `Order ID: ${currentOrderId}\nYour order has been confirmed and you will receive updates via email.`;
        alert(message);
    }
    goToHomepage();
}
