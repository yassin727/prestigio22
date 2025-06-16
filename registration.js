document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    
    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const termsCheckbox = document.getElementById('terms');
    
    // Validation patterns
    const patterns = {
        name: /^[a-zA-Z\s]{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?[\d\s-]{10,}$/
    };
    
    // Real-time validation functions
    function validateName() {
        const name = nameInput.value.trim();
        const nameError = document.getElementById('nameError');
        
        if (!patterns.name.test(name)) {
            nameError.textContent = 'Please enter a valid name (2-50 characters, letters only)';
            return false;
        }
        nameError.textContent = '';
        return true;
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        
        if (!patterns.email.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        emailError.textContent = '';
        return true;
    }
    
    function validatePhone() {
        const phone = phoneInput.value.trim();
        const phoneError = document.getElementById('phoneError');
        
        if (!patterns.phone.test(phone)) {
            phoneError.textContent = 'Please enter a valid phone number';
            return false;
        }
        phoneError.textContent = '';
        return true;
    }
    
    function validateTerms() {
        const termsError = document.getElementById('termsError');
        
        if (!termsCheckbox.checked) {
            termsError.textContent = 'You must agree to the terms and conditions';
            return false;
        }
        termsError.textContent = '';
        return true;
    }
    
    // Add event listeners for real-time validation
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    phoneInput.addEventListener('input', validatePhone);
    termsCheckbox.addEventListener('change', validateTerms);
    
    // Form submission
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isTermsValid = validateTerms();
        
        if (!isNameValid || !isEmailValid || !isPhoneValid || !isTermsValid) {
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim()
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                alert('Registration successful! Please check your email for login credentials.');
                // Redirect to login page
                window.location.href = '/login';
            } else {
                showError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred during registration');
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
} 