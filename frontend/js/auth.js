// Auth module for handling user authentication

document.addEventListener('DOMContentLoaded', () => {
    // Don't intercept auth button clicks on the homepage
    // Let them navigate normally to their respective pages
    console.log('Auth.js loaded - allowing normal navigation for auth buttons');
});

// Show loading indicator
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Handle Sign In
async function handleSignIn(event) {
    if (event) event.preventDefault();
    
    showLoading();
    
    try {
        // Create a simple modal for better UX
        const username = prompt('Enter your username:');
        if (username === null) {
            hideLoading();
            return; // User cancelled
        }
        
        const password = prompt('Enter your password:');
        if (password === null) {
            hideLoading();
            return; // User cancelled
        }
        
        if (!username.trim() || !password.trim()) {
            hideLoading();
            alert('Both username and password are required');
            return;
        }
        
        console.log('Attempting to log in with:', username);
        
        // Get CSRF token first if using CSRF protection
        const csrfResponse = await fetch('http://localhost:5000/api/csrf-token', {
            credentials: 'include'
        });
        const csrfData = await csrfResponse.json();
        
        // Send login request to backend
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfData.csrfToken || ''
            },
            body: JSON.stringify({ 
                username: username.trim(),
                password: password.trim()
            }),
            credentials: 'include',
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Login successful
        console.log('Login successful:', data);
        alert('Login successful!');
        
        // Update UI based on login state
        updateAuthUI(true);
        
        // Redirect to dashboard or home page
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Handle Sign Up
async function handleSignUp(event) {
    if (event) event.preventDefault();
    
    showLoading();
    
    try {
        const username = prompt('Choose a username:');
        if (username === null) {
            hideLoading();
            return;
        }
        
        const email = prompt('Enter your email:');
        if (email === null) {
            hideLoading();
            return;
        }
        
        const password = prompt('Choose a password:');
        if (password === null) {
            hideLoading();
            return;
        }
        
        if (!username.trim() || !email.trim() || !password.trim()) {
            alert('All fields are required');
            hideLoading();
            return;
        }
        
        console.log('Attempting to register:', { username, email });
        
        // Get CSRF token first
        const csrfResponse = await fetch('http://localhost:5000/api/csrf-token', {
            credentials: 'include'
        });
        const csrfData = await csrfResponse.json();
        
        // Send registration request
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfData.csrfToken || ''
            },
            body: JSON.stringify({
                username: username.trim(),
                email: email.trim(),
                password: password.trim()
            }),
            credentials: 'include',
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        console.log('Registration successful:', data);
        alert('Registration successful! Please check your email to verify your account.');
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Update UI based on authentication state
function updateAuthUI(isLoggedIn) {
    const signInBtn = document.querySelector('.signin-btn');
    const signUpBtn = document.querySelector('.signup-btn');
    
    if (isLoggedIn) {
        if (signInBtn) signInBtn.textContent = 'Profile';
        if (signUpBtn) signUpBtn.textContent = 'Logout';
    } else {
        if (signInBtn) signInBtn.textContent = 'Sign In';
        if (signUpBtn) signUpBtn.textContent = 'Sign Up';
    }
}

// Handle logout
function handleLogout() {
    // Clear any stored tokens or user data
    document.cookie = 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = '_csrf=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Update UI
    updateAuthUI(false);
    
    // Redirect to home page
    window.location.href = '/';
}

// Make functions available globally
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.handleLogout = handleLogout;
