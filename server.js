const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Serve other HTML files from the pages directory
app.get('/pages/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'frontend', 'pages', page));
});

// Serve car customizer from root level for compatibility
app.get('/car-customizer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'car-customizer.html'));
});

// Mock API endpoints
app.get('/api/csrf-token', (req, res) => {
    res.json({ token: 'test-csrf-token' });
});

app.post('/api/auth/register', (req, res) => {
    console.log('Registration attempt:', req.body);
    setTimeout(() => {
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            redirectUrl: '/pages/car-selection.html'
        });
    }, 1000);
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    // Demo users for testing
    const DEMO_USERS = {
        'admin': { 
            password: 'admin123',
            isAdmin: true,
            fullName: 'Administrator'
        },
        'user': { 
            password: 'password',
            isAdmin: false,
            fullName: 'Demo User'
        },
        'demo': { 
            password: 'demo123',
            isAdmin: false,
            fullName: 'Demo User'
        },
        'prestigio': { 
            password: 'luxury2024',
            isAdmin: false,
            fullName: 'Prestigio User'
        }
    };
    
    if (DEMO_USERS[username] && DEMO_USERS[username].password === password) {
        const demoUser = DEMO_USERS[username];
        console.log(`✅ Login successful for user: ${username}`);
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                username,
                fullName: demoUser.fullName,
                email: `${username}@prestigio.com`,
                isAdmin: demoUser.isAdmin
            }
        });
    } else {
        console.log(`❌ Login failed for user: ${username}`);
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Home page: http://localhost:${port}/`);
    console.log(`Registration: http://localhost:${port}/pages/registration.html`);
    console.log(`Login: http://localhost:${port}/pages/login.html`);
    console.log(`Car Selection: http://localhost:${port}/pages/car-selection.html`);
});
