const fs = require('fs');
const path = require('path');

// Create necessary directories
const directories = [
    'frontend/assets/images',
    'frontend/assets/models',
    'frontend/assets/logos',
    'frontend/css',
    'frontend/js',
    'frontend/pages',
    'backend/src/controllers',
    'backend/src/models',
    'backend/src/routes',
    'backend/src/middleware',
    'backend/src/utils',
    'backend/src/config',
    'backend/src/public',
    'backend/uploads'
];

// Create directories if they don't exist
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// File movements mapping
const fileMovements = {
    // Frontend HTML files
    'home.html': 'frontend/index.html',
    'login.html': 'frontend/pages/login.html',
    'registration.html': 'frontend/pages/registration.html',
    'forgotpassword.html': 'frontend/pages/forgot-password.html',
    'customerservice.html': 'frontend/pages/customer-service.html',
    'contactus.html': 'frontend/pages/contact.html',
    'luxurycars.html': 'frontend/pages/luxury-cars.html',
    'regularcars.html': 'frontend/pages/regular-cars.html',
    'specialeditions.html': 'frontend/pages/special-editions.html',
    'newarrivals.html': 'frontend/pages/new-arrivals.html',
    'car-customizer.html': 'frontend/pages/car-customizer.html',
    'admindashboard.html': 'frontend/pages/admin/dashboard.html',

    // Frontend CSS files
    'styles.css': 'frontend/css/styles.css',
    'auth.css': 'frontend/css/auth.css',
    'car-customizer.css': 'frontend/css/car-customizer.css',
    'admin.css': 'frontend/css/admin.css',
    'admin-controls.css': 'frontend/css/admin-controls.css',
    'customerservice.css': 'frontend/css/customer-service.css',
    'luxurycars.css': 'frontend/css/luxury-cars.css',
    'rf.css': 'frontend/css/regular-cars.css',

    // Frontend JavaScript files
    'home.js': 'frontend/js/main.js',
    'login.js': 'frontend/js/auth.js',
    'registration.js': 'frontend/js/auth.js',
    'customerservice.js': 'frontend/js/customer-service.js',
    'car-customizer-enhancements.js': 'frontend/js/car-customizer.js',
    'car-models.js': 'frontend/js/car-models.js',
    'admin.js': 'frontend/js/admin.js',
    'particles.js': 'frontend/js/particles.js',

    // 3D Model files
    'scene.gltf': 'frontend/assets/models/scene.gltf',
    'dodge_challenger_demon.glb': 'frontend/assets/models/dodge_challenger_demon.glb',
    'GLTFLoader.js': 'frontend/assets/models/GLTFLoader.js',
    'three.module.js': 'frontend/assets/models/three.module.js',
    'three.cjs': 'frontend/assets/models/three.cjs',

    // Backend files
    'mongo.env.txt': 'backend/.env'
};

// Move files
Object.entries(fileMovements).forEach(([source, destination]) => {
    const sourcePath = path.join(__dirname, source);
    const destPath = path.join(__dirname, destination);

    if (fs.existsSync(sourcePath)) {
        // Create destination directory if it doesn't exist
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy file to new location
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Moved ${source} to ${destination}`);
    }
});

// Move directories
const directoryMovements = {
    'logos': 'frontend/assets/logos',
    'images': 'frontend/assets/images'
};

Object.entries(directoryMovements).forEach(([source, destination]) => {
    const sourcePath = path.join(__dirname, source);
    const destPath = path.join(__dirname, destination);

    if (fs.existsSync(sourcePath)) {
        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        // Copy directory contents
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`Moved directory ${source} to ${destination}`);
    }
});

console.log('File organization complete!'); 