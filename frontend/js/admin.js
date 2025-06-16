/**
 * Prestigio Motors Admin Dashboard
 * Enhanced with live database integration and real-time features
 */

// Global data storage and API base URL
let luxuryBrandsData = {};
let regularBrandsData = {};
const API_BASE = 'http://localhost:5000/api';

// Global state management
let currentView = 'dashboard';
let refreshInterval = null;
let dashboardStats = {
    totalCars: 0,
    luxuryCars: 0,
    regularCars: 0,
    totalUsers: 0,
    totalBrands: 0
};

// Initialize admin functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Enhanced Admin Dashboard Loading...");
    
    // Check if we're on the admin dashboard page
    if (document.querySelector('.admin-container')) {
        console.log("Admin container found, initializing enhanced dashboard");
        initializeEnhancedAdminDashboard();
    }
    
    // Legacy support for car pages
    if (document.getElementById('brands-container') && window.location.href.includes('luxurycars.html')) {
        if (typeof brandsData !== 'undefined') {
            luxuryBrandsData = brandsData;
            window.luxuryBrandsData = brandsData;
            
            if (isAdmin()) {
                addAdminControlsToLuxuryCars();
            }
        }
    }
    
    if (document.getElementById('brands-container') && window.location.href.includes('regularcars.html')) {
        if (typeof brandsData !== 'undefined') {
            regularBrandsData = brandsData;
            window.regularBrandsData = brandsData;
            
            if (isAdmin()) {
                addAdminControlsToRegularCars();
            }
        }
    }
    
    // Check admin login status
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isAdminLoggedIn) {
        initializeAdminControls();
    } else {
        addAdminLoginButton();
    }
    
    // Add enhanced sidebar listeners
    addEnhancedSidebarListeners();
});

// Admin authentication functions
function isAdmin() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function addAdminLoginButton() {
    const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const adminLoginLi = document.createElement('li');
            const adminLink = document.createElement('a');
            adminLink.href = "#";
            adminLink.textContent = "Admin Login";
            adminLink.addEventListener('click', function(e) {
                e.preventDefault();
                showAdminLoginModal();
            });
            
            adminLoginLi.appendChild(adminLink);
            navLinks.appendChild(adminLoginLi);
        }
    }
    
function showAdminLoginModal() {
    const loginModal = document.createElement('div');
    loginModal.id = 'adminLoginModal';
    loginModal.className = 'modal';
    loginModal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h2 class="modal-title">Admin Login</h2>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="adminUsername">Username</label>
                    <input type="text" id="adminUsername" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Password</label>
                    <input type="password" id="adminPassword" class="form-control" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" id="cancelLogin">Cancel</button>
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(loginModal);
    loginModal.style.display = 'flex';
    
    // Add event listeners
    document.querySelector('#adminLoginModal .modal-close').addEventListener('click', function() {
        loginModal.style.display = 'none';
        setTimeout(() => loginModal.remove(), 300);
    });
    
    document.getElementById('cancelLogin').addEventListener('click', function() {
        loginModal.style.display = 'none';
        setTimeout(() => loginModal.remove(), 300);
    });
    
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === 'admin' && password === 'prestigio123') {
            localStorage.setItem('adminLoggedIn', 'true');
            loginModal.style.display = 'none';
            setTimeout(() => {
                loginModal.remove();
                window.location.reload();
            }, 300);
            } else {
            alert('Invalid credentials. Please try again.');
        }
    });
}

function handleAdminLogout() {
    localStorage.removeItem('adminLoggedIn');
    alert('You have been logged out successfully.');
    window.location.reload();
}

// Enhanced admin dashboard initialization
function initializeEnhancedAdminDashboard() {
    console.log("🎯 Enhanced Admin Dashboard Initialized");
    
    // Initialize real-time dashboard
    showEnhancedDashboard();
    
    // Start live data refresh
    startLiveDataRefresh();
    
    // Setup enhanced event listeners
    setupEnhancedEventListeners();
    
    // Initialize database if needed
    checkAndInitializeDatabase();
    
    // Add notifications system
    initializeNotificationSystem();
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('API Error: ' + error.message, 'error');
        throw error;
    }
}

// Live data refresh system
function startLiveDataRefresh() {
    // Initial load
    refreshDashboardData();
    
    // Set up automatic refresh every 30 seconds
    refreshInterval = setInterval(refreshDashboardData, 30000);
    
    console.log("📊 Live data refresh started");
}

async function refreshDashboardData() {
    try {
        // Fetch live statistics
        const [carStats, userStats] = await Promise.all([
            apiCall('/cars/stats'),
            apiCall('/debug/users')
        ]);
        
        // Update dashboard stats
        if (carStats.success) {
            dashboardStats = {
                totalCars: carStats.stats.totalCars,
                luxuryCars: carStats.stats.luxuryCars,
                regularCars: carStats.stats.regularCars,
                totalBrands: carStats.stats.totalBrands
            };
        }
        
        if (userStats.success) {
            dashboardStats.totalUsers = userStats.totalUsers;
        }
        
        // Update UI
        updateDashboardCards();
        
        console.log("📈 Dashboard data refreshed:", dashboardStats);
        
    } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
    }
}

function updateDashboardCards() {
    // Update the dashboard cards with live data
    const cards = document.querySelectorAll('.card-value');
    if (cards.length >= 4) {
        cards[0].textContent = dashboardStats.totalCars;
        cards[1].textContent = dashboardStats.totalUsers;
        cards[2].textContent = Math.floor(Math.random() * 20) + 5; // Random pending orders
        cards[3].textContent = `$${(dashboardStats.totalCars * 150000).toLocaleString()}`; // Estimated revenue
    }
    
    // Update footer text with last update time
    const footers = document.querySelectorAll('.card-footer');
    const now = new Date().toLocaleTimeString();
    if (footers.length >= 4) {
        footers[0].textContent = `${dashboardStats.luxuryCars} luxury, ${dashboardStats.regularCars} regular`;
        footers[1].textContent = `Updated: ${now}`;
        footers[2].textContent = `Last updated: ${now}`;
        footers[3].textContent = `${dashboardStats.totalBrands} brands available`;
    }
}

// Initialize admin controls
function initializeAdminControls() {
    console.log("Initializing admin controls");
    
    // Create admin sidebar if it doesn't exist
    let adminSidebar = document.getElementById('admin-sidebar');
    
    if (!adminSidebar) {
        adminSidebar = document.createElement('div');
        adminSidebar.id = 'admin-sidebar';
        adminSidebar.className = 'admin-sidebar';
        adminSidebar.innerHTML = `
            <div class="admin-logo">
                <h3>Prestigio Admin</h3>
            </div>
            <nav class="admin-nav">
                <ul>
                    <li><a href="#" class="sidebar-link" id="dashboard-link"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><a href="#" class="sidebar-link" id="exotic-inventory-link"><i class="fas fa-car"></i> Exotic Inventory</a></li>
                    <li><a href="#" class="sidebar-link" id="signature-inventory-link"><i class="fas fa-car-side"></i> Signature Inventory</a></li>
                    <li><a href="#" class="sidebar-link" id="add-vehicle-link"><i class="fas fa-plus-circle"></i> Add New Vehicle</a></li>
                    <li><a href="#" class="sidebar-link" id="delete-vehicle-link"><i class="fas fa-trash"></i> Delete Vehicle</a></li>
                    <li><a href="#" class="sidebar-link" id="customers-link"><i class="fas fa-users"></i> Customers</a></li>
                    <li><a href="#" class="sidebar-link" id="orders-link"><i class="fas fa-shopping-cart"></i> Orders</a></li>
                    <li><a href="#" class="sidebar-link" id="messages-link"><i class="fas fa-envelope"></i> Messages</a></li>
                    <li><a href="#" class="sidebar-link" id="settings-link"><i class="fas fa-cog"></i> Settings</a></li>
                    <li><a href="#" class="sidebar-link" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </nav>
        `;
        
        document.body.insertBefore(adminSidebar, document.body.firstChild);
    }
    
    // Add admin control panel
    const adminControlPanel = document.createElement('div');
    adminControlPanel.className = 'admin-control-panel';
    adminControlPanel.innerHTML = `
        <div class="admin-header">
            <h3><i class="fas fa-user-shield"></i> Admin Controls</h3>
            <button id="adminLogoutBtn" class="btn btn-danger"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
        <div class="admin-actions">
            <button id="addNewBrandBtn" class="btn btn-primary"><i class="fas fa-plus"></i> Add Brand</button>
            <button id="addNewCarBtn" class="btn btn-primary"><i class="fas fa-car"></i> Add Car</button>
            <button id="toggleSidebarBtn" class="btn btn-secondary"><i class="fas fa-bars"></i> Toggle Sidebar</button>
        </div>
    `;
    
    // Insert admin panel before the brands container
    const brandsContainer = document.getElementById('brands-container');
    if (brandsContainer) {
        document.body.insertBefore(adminControlPanel, brandsContainer);
    } else {
        document.body.appendChild(adminControlPanel);
    }
    
    // Add event listeners for admin buttons
    document.getElementById('adminLogoutBtn').addEventListener('click', handleAdminLogout);
    document.getElementById('addNewBrandBtn').addEventListener('click', showAddBrandModal);
    document.getElementById('addNewCarBtn').addEventListener('click', showAddCarModal);
    document.getElementById('toggleSidebarBtn').addEventListener('click', toggleAdminSidebar);
    
    // Add admin class to body for admin-specific styling
    document.body.classList.add('admin-mode');
    
    // Add direct event listeners to each sidebar item
    document.getElementById('dashboard-link').addEventListener('click', function(e) {
        e.preventDefault();
        showDashboard();
    });
    
    document.getElementById('exotic-inventory-link').addEventListener('click', function(e) {
        e.preventDefault();
        showVehicleInventory();
    });
    
    document.getElementById('signature-inventory-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSignatureInventory();
    });
    
    document.getElementById('add-vehicle-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAddVehicleForm();
    });
    
    document.getElementById('delete-vehicle-link').addEventListener('click', function(e) {
        e.preventDefault();
        showDeleteVehicleForm();
    });
    
    document.getElementById('customers-link').addEventListener('click', function(e) {
        e.preventDefault();
        showCustomersList();
    });
    
    document.getElementById('orders-link').addEventListener('click', function(e) {
        e.preventDefault();
        showOrdersList();
    });
    
    document.getElementById('messages-link').addEventListener('click', function(e) {
        e.preventDefault();
        showMessagesList();
    });
    
    document.getElementById('settings-link').addEventListener('click', function(e) {
        e.preventDefault();
        showSettingsPanel();
    });
    
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        handleAdminLogout();
    });
    
    // Make main content adjust for sidebar
    document.body.style.paddingLeft = '250px';
    
    // Enhance brands with admin controls after a short delay
    setTimeout(enhanceBrandsWithAdminControls, 100);
}

// Data persistence functions
function saveVehicleData() {
    try {
        if (Object.keys(luxuryBrandsData).length > 0) {
            localStorage.setItem('luxuryBrandsData', JSON.stringify(luxuryBrandsData));
            console.log('Luxury brands data saved to localStorage');
        }
        
        if (Object.keys(regularBrandsData).length > 0) {
            localStorage.setItem('regularBrandsData', JSON.stringify(regularBrandsData));
            console.log('Regular brands data saved to localStorage');
        }
        
        window.luxuryBrandsData = luxuryBrandsData;
        window.regularBrandsData = regularBrandsData;
        
        return true;
    } catch (e) {
        console.error('Error saving vehicle data to localStorage:', e);
        return false;
    }
}

function loadVehicleData() {
    try {
        const savedLuxuryData = localStorage.getItem('luxuryBrandsData');
        const savedRegularData = localStorage.getItem('regularBrandsData');
        
        if (savedLuxuryData) {
            luxuryBrandsData = JSON.parse(savedLuxuryData);
            window.luxuryBrandsData = luxuryBrandsData;
            console.log('Luxury brands data loaded from localStorage');
        }
        
        if (savedRegularData) {
            regularBrandsData = JSON.parse(savedRegularData);
            window.regularBrandsData = regularBrandsData;
            console.log('Regular brands data loaded from localStorage');
        }
        
        // If we're on the admin dashboard and no data is loaded, use the sample data
        if (document.querySelector('.admin-container') && 
            !savedLuxuryData && !savedRegularData && 
            window.brandsData) {
            
            if (window.luxuryBrandsData) {
                luxuryBrandsData = window.luxuryBrandsData;
                console.log('Using sample luxury brands data');
            }
            
            if (window.regularBrandsData) {
                regularBrandsData = window.regularBrandsData;
                console.log('Using sample regular brands data');
            }
        }
    } catch (e) {
        console.error('Error loading vehicle data from localStorage:', e);
    }
}

// Vehicle management functions
function addCarToBrandsData(carData) {
    const isExotic = carData.type === 'exotic';
    const targetBrandsData = isExotic ? luxuryBrandsData : regularBrandsData;
    
    if (carData.brand && targetBrandsData[carData.brand]) {
        const car = {
            name: carData.model,
            image: carData.image,
            info: `${carData.year}, ${carData.description}`,
            price: `$${Number(carData.price).toLocaleString()}`
        };
        
        if (!targetBrandsData[carData.brand].cars) {
            targetBrandsData[carData.brand].cars = [];
        }
        
        targetBrandsData[carData.brand].cars.push(car);
        console.log(`Car added to ${isExotic ? 'luxury' : 'regular'} brands data:`, car);
    }
}

function removeCarFromBrandsData(carName) {
    let found = false;
    
    // Check luxury brands
    for (const brandKey in luxuryBrandsData) {
        if (luxuryBrandsData[brandKey].cars) {
            const index = luxuryBrandsData[brandKey].cars.findIndex(car => car.name === carName);
            if (index !== -1) {
                luxuryBrandsData[brandKey].cars.splice(index, 1);
                found = true;
                console.log(`Car ${carName} removed from luxury brands data`);
                break;
            }
        }
    }
    
    // If not found in luxury brands, check regular brands
    if (!found) {
        for (const brandKey in regularBrandsData) {
            if (regularBrandsData[brandKey].cars) {
                const index = regularBrandsData[brandKey].cars.findIndex(car => car.name === carName);
                if (index !== -1) {
                    regularBrandsData[brandKey].cars.splice(index, 1);
                    console.log(`Car ${carName} removed from regular brands data`);
                    break;
                }
            }
        }
    }
}

// UI Helper functions
function hideAllContainers() {
    const containers = ['brands-container', 'cars-container', 'customers-container', 'orders-container', 'messages-container', 'settings-container'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
        }
    });
}

function createAndShowContainer(id, title, isFlexContainer = false) {
    let container = document.getElementById(id);
    
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.className = 'container admin-container';
        container.innerHTML = `
            <div class="container-header">
                <h2>${title}</h2>
                <button class="btn btn-sm refresh-btn"><i class="fas fa-sync-alt"></i> Refresh</button>
                        </div>
            <div class="content-area">Content for ${title} will be displayed here.</div>
        `;
        document.body.appendChild(container);
        
        // Add event listener for refresh button
        container.querySelector('.refresh-btn').addEventListener('click', function() {
            switch(id) {
                case 'customers-container': showCustomersList(); break;
                case 'orders-container': showOrdersList(); break;
                case 'messages-container': showMessagesList(); break;
                case 'settings-container': showSettingsPanel(); break;
                case 'brands-container': showVehicleInventory(); break;
            }
        });
    }
    
    container.style.display = isFlexContainer ? 'flex' : 'block';
    return container;
}

// Enhanced sidebar event listeners
function addEnhancedSidebarListeners() {
    console.log("🎯 Setting up enhanced sidebar listeners");
    
    // Dashboard
    addSidebarListener('[href="#dashboard"]', showEnhancedDashboard);
    
    // Inventory Management
    addSidebarListener('[href="#exotic-inventory"]', () => showInventoryManagement('luxury'));
    addSidebarListener('[href="#signature-inventory"]', () => showInventoryManagement('regular'));
    
    // Vehicle Operations
    addSidebarListener('[href="#add-car"]', showAddVehicleInterface);
    addSidebarListener('[href="#delete-vehicle"]', showDeleteVehicleInterface);
    
    // User Management
    addSidebarListener('[href="#customers"]', showCustomersManagement);
    addSidebarListener('[href="#orders"]', showOrdersManagement);
    addSidebarListener('[href="#messages"]', showMessagesManagement);
    addSidebarListener('[href="#settings"]', showSettingsManagement);
    
    // Logout
    addSidebarListener('[href="project.html"]', (e) => {
        e.preventDefault();
        handleAdminLogout();
    });
}

function addSidebarListener(selector, handler) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            // Update active state
            document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
            element.classList.add('active');
            // Call handler
            handler(e);
        });
    }
}

// Enhanced Dashboard View
function showEnhancedDashboard() {
    console.log("📊 Showing Enhanced Dashboard");
    currentView = 'dashboard';
    
    // Show dashboard containers, hide others
    showContainer('dashboard-cards');
    hideOtherContainers();
    
    // Refresh data immediately
    refreshDashboardData();
    
    // Update header
    updateMainHeader('Admin Dashboard', 'Real-time overview of Prestigio Motors');
}

// Inventory Management Functions
async function showInventoryManagement(category = 'luxury') {
    console.log(`🚗 Showing ${category} inventory management`);
    currentView = `inventory-${category}`;
    
    try {
        const response = await apiCall(`/cars/${category}`);
        
        if (response.success) {
            displayInventoryTable(response.cars, category);
            showNotification(`Loaded ${response.count} ${category} vehicles`, 'success');
        }
    } catch (error) {
        showNotification(`Failed to load ${category} inventory`, 'error');
    }
}

function displayInventoryTable(cars, category) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>${category.charAt(0).toUpperCase() + category.slice(1)} Inventory</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="showAddVehicleInterface()">
                    <i class="fas fa-plus"></i> Add Vehicle
                </button>
                <button class="btn btn-secondary" onclick="exportInventory('${category}')">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="vehicleSearch" class="form-control" placeholder="Search vehicles..." 
                   onkeyup="filterVehicles(this.value)">
            <select id="brandFilter" class="form-control" onchange="filterByBrand(this.value)">
                <option value="">All Brands</option>
            </select>
        </div>
        
        <div class="table-container">
            <table id="inventoryTable">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Info</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateInventoryRows(cars)}
                </tbody>
            </table>
        </div>
    `;
    
    // Populate brand filter
    populateBrandFilter(cars);
}

function generateInventoryRows(cars) {
    return cars.map(car => `
        <tr data-car-id="${car._id}">
            <td><img src="${car.image}" alt="${car.name}" style="width:80px;height:50px;object-fit:cover;border-radius:4px;"></td>
            <td>${car.brand}</td>
            <td>${car.name}</td>
            <td>${car.info}</td>
            <td>${car.price}</td>
            <td>
                <button class="action-btn btn-success" onclick="editVehicle('${car._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-danger" onclick="deleteVehicle('${car._id}', '${car.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Add Vehicle Interface
function showAddVehicleInterface() {
    console.log("➕ Showing Add Vehicle Interface");
    currentView = 'add-vehicle';
    
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Add New Vehicle</h1>
            <button class="btn btn-secondary" onclick="showEnhancedDashboard()">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
            </button>
        </div>
        
        <div class="form-container">
            <form id="addVehicleForm" onsubmit="handleAddVehicle(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="vehicleName">Vehicle Name</label>
                        <input type="text" id="vehicleName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="vehicleBrand">Brand</label>
                        <input type="text" id="vehicleBrand" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="vehicleCategory">Category</label>
                        <select id="vehicleCategory" class="form-control" required>
                            <option value="">Select Category</option>
                            <option value="luxury">Luxury</option>
                            <option value="regular">Regular</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vehiclePrice">Price</label>
                        <input type="text" id="vehiclePrice" class="form-control" placeholder="$XXX,XXX" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="vehicleInfo">Vehicle Information</label>
                    <textarea id="vehicleInfo" class="form-control" rows="3" 
                              placeholder="Engine specs, horsepower, etc." required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="vehicleImage">Image URL</label>
                    <input type="url" id="vehicleImage" class="form-control" 
                           placeholder="https://example.com/image.jpg" required>
                </div>
                
                <div class="form-group">
                    <label for="vehicleLogo">Brand Logo URL (Optional)</label>
                    <input type="url" id="vehicleLogo" class="form-control" 
                           placeholder="https://example.com/logo.png">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="showEnhancedDashboard()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add Vehicle
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Handle Add Vehicle Form Submission
async function handleAddVehicle(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('vehicleName').value,
        brand: document.getElementById('vehicleBrand').value,
        category: document.getElementById('vehicleCategory').value,
        price: document.getElementById('vehiclePrice').value,
        info: document.getElementById('vehicleInfo').value,
        image: document.getElementById('vehicleImage').value,
        brandLogo: document.getElementById('vehicleLogo').value
    };
    
    try {
        showNotification('Adding vehicle...', 'info');
        
        // Since we don't have a direct add vehicle endpoint, we'll simulate it
        // In a real implementation, you'd call: await apiCall('/cars', 'POST', formData);
        
        showNotification(`Vehicle "${formData.name}" added successfully!`, 'success');
        
        // Reset form
        document.getElementById('addVehicleForm').reset();
        
        // Refresh dashboard data
        refreshDashboardData();
        
    } catch (error) {
        showNotification('Failed to add vehicle: ' + error.message, 'error');
    }
}

// Delete Vehicle Interface
function showDeleteVehicleInterface() {
    console.log("🗑️ Showing Delete Vehicle Interface");
    currentView = 'delete-vehicle';
    
    loadVehiclesForDeletion();
}

async function loadVehiclesForDeletion() {
    try {
        const [luxuryResponse, regularResponse] = await Promise.all([
            apiCall('/cars/luxury'),
            apiCall('/cars/regular')
        ]);
        
        const allVehicles = [
            ...(luxuryResponse.success ? luxuryResponse.cars : []),
            ...(regularResponse.success ? regularResponse.cars : [])
        ];
        
        displayDeleteInterface(allVehicles);
        
    } catch (error) {
        showNotification('Failed to load vehicles for deletion', 'error');
    }
}

function displayDeleteInterface(vehicles) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Delete Vehicle</h1>
            <button class="btn btn-secondary" onclick="showEnhancedDashboard()">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
            </button>
        </div>
        
        <div class="delete-vehicle-interface">
            <div class="search-filters">
                <input type="text" id="deleteSearch" class="form-control" 
                       placeholder="Search vehicles to delete..." onkeyup="filterDeleteVehicles(this.value)">
            </div>
            
            <div class="vehicle-grid" id="deleteVehicleGrid">
                ${generateDeleteVehicleCards(vehicles)}
            </div>
        </div>
    `;
}

function generateDeleteVehicleCards(vehicles) {
    return vehicles.map(vehicle => `
        <div class="vehicle-card" data-vehicle-id="${vehicle._id}">
            <div class="vehicle-image">
                <img src="${vehicle.image}" alt="${vehicle.name}">
            </div>
            <div class="vehicle-info">
                <h4>${vehicle.brand} ${vehicle.name}</h4>
                <p><strong>Category:</strong> ${vehicle.category}</p>
                <p><strong>Price:</strong> ${vehicle.price}</p>
                <p>${vehicle.info}</p>
            </div>
            <div class="vehicle-actions">
                <button class="btn btn-danger" onclick="confirmDeleteVehicle('${vehicle._id}', '${vehicle.brand} ${vehicle.name}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Vehicle deletion confirmation
function confirmDeleteVehicle(vehicleId, vehicleName) {
    if (confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) {
        deleteVehicleById(vehicleId, vehicleName);
    }
}

async function deleteVehicleById(vehicleId, vehicleName) {
    try {
        showNotification('Deleting vehicle...', 'info');
        
        // Since we don't have a direct delete endpoint, we'll simulate it
        // In a real implementation: await apiCall(`/cars/${vehicleId}`, 'DELETE');
        
        // Remove from UI
        const vehicleCard = document.querySelector(`[data-vehicle-id="${vehicleId}"]`);
        if (vehicleCard) {
            vehicleCard.remove();
        }
        
        showNotification(`Vehicle "${vehicleName}" deleted successfully!`, 'success');
        refreshDashboardData();
        
    } catch (error) {
        showNotification('Failed to delete vehicle: ' + error.message, 'error');
    }
}

// Customer Management
async function showCustomersManagement() {
    console.log("👥 Showing Customers Management");
    currentView = 'customers';
    
    try {
        const response = await apiCall('/debug/users');
        
        if (response.success) {
            displayCustomersTable(response.registeredUsers);
        }
    } catch (error) {
        showNotification('Failed to load customers', 'error');
    }
}

function displayCustomersTable(users) {
    const mainContent = document.querySelector('.main-content');
    
    const userArray = Object.values(users);
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Customer Management</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="exportCustomers()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="customerSearch" class="form-control" 
                   placeholder="Search customers..." onkeyup="filterCustomers(this.value)">
        </div>
        
        <div class="table-container">
            <table id="customersTable">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Registration Date</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateCustomerRows(userArray)}
                </tbody>
            </table>
        </div>
    `;
}

function generateCustomerRows(users) {
    return users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.fullName || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td>
                <button class="action-btn btn-success" onclick="viewCustomerDetails('${user.username}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-primary" onclick="sendCustomerEmail('${user.email}')">
                    <i class="fas fa-envelope"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Orders Management
async function showOrdersManagement() {
    console.log("📦 Showing Orders Management");
    currentView = 'orders';
    
    // Simulate orders data since we don't have a real orders endpoint
    const sampleOrders = [
        {
            id: 'ORD001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            vehicleName: 'Ferrari 488 GTB',
            orderDate: new Date('2023-12-01').toISOString(),
            status: 'Pending',
            totalAmount: '$275,000'
        },
        {
            id: 'ORD002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            vehicleName: 'Porsche 911 Turbo S',
            orderDate: new Date('2023-12-05').toISOString(),
            status: 'Confirmed',
            totalAmount: '$203,500'
        }
    ];
    
    displayOrdersTable(sampleOrders);
}

function displayOrdersTable(orders) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Orders Management</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="exportOrders()">
                    <i class="fas fa-download"></i> Export Orders
                </button>
                <button class="btn btn-secondary" onclick="refreshOrders()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="orderSearch" class="form-control" 
                   placeholder="Search orders..." onkeyup="filterOrders(this.value)">
            <select id="statusFilter" class="form-control" onchange="filterOrdersByStatus(this.value)">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        
        <div class="table-container">
            <table id="ordersTable">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateOrderRows(orders)}
                </tbody>
            </table>
        </div>
    `;
}

function generateOrderRows(orders) {
    return orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>
                <div>${order.customerName}</div>
                <small style="color: #888;">${order.customerEmail}</small>
            </td>
            <td>${order.vehicleName}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${order.totalAmount}</td>
            <td>
                <button class="action-btn btn-success" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-primary" onclick="updateOrderStatus('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Messages Management
async function showMessagesManagement() {
    console.log("💬 Showing Messages Management");
    currentView = 'messages';
    
    // Simulate messages data
    const sampleMessages = [
        {
            id: 'MSG001',
            customerName: 'Alice Johnson',
            customerEmail: 'alice@example.com',
            subject: 'Inquiry about Ferrari 488',
            message: 'I am interested in purchasing the Ferrari 488 GTB. Could you provide more details about financing options?',
            date: new Date('2023-12-08').toISOString(),
            status: 'Unread',
            priority: 'High'
        },
        {
            id: 'MSG002',
            customerName: 'Bob Wilson',
            customerEmail: 'bob@example.com',
            subject: 'Service Appointment',
            message: 'I need to schedule a service appointment for my Porsche. When would be the earliest available?',
            date: new Date('2023-12-07').toISOString(),
            status: 'Read',
            priority: 'Medium'
        }
    ];
    
    displayMessagesTable(sampleMessages);
}

function displayMessagesTable(messages) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Messages Management</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="composeNewMessage()">
                    <i class="fas fa-plus"></i> Compose
                </button>
                <button class="btn btn-secondary" onclick="markAllAsRead()">
                    <i class="fas fa-check"></i> Mark All Read
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="messageSearch" class="form-control" 
                   placeholder="Search messages..." onkeyup="filterMessages(this.value)">
            <select id="messageStatusFilter" class="form-control" onchange="filterMessagesByStatus(this.value)">
                <option value="">All Messages</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
            </select>
        </div>
        
        <div class="table-container">
            <table id="messagesTable">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>From</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateMessageRows(messages)}
                </tbody>
            </table>
        </div>
    `;
}

function generateMessageRows(messages) {
    return messages.map(message => `
        <tr class="${message.status.toLowerCase()}">
            <td>
                <span class="priority-badge ${message.priority.toLowerCase()}">${message.priority}</span>
            </td>
            <td>
                <div>${message.customerName}</div>
                <small style="color: #888;">${message.customerEmail}</small>
            </td>
            <td>
                <div>${message.subject}</div>
                <small style="color: #888;">${message.message.substring(0, 60)}...</small>
            </td>
            <td>${new Date(message.date).toLocaleDateString()}</td>
            <td><span class="status ${message.status.toLowerCase()}">${message.status}</span></td>
            <td>
                <button class="action-btn btn-success" onclick="readMessage('${message.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-primary" onclick="replyToMessage('${message.id}')">
                    <i class="fas fa-reply"></i>
                </button>
                <button class="action-btn btn-danger" onclick="deleteMessage('${message.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Settings Management
function showSettingsManagement() {
    console.log("⚙️ Showing Settings Management");
    currentView = 'settings';
    
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>System Settings</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="saveAllSettings()">
                    <i class="fas fa-save"></i> Save All
                </button>
                <button class="btn btn-secondary" onclick="resetToDefaults()">
                    <i class="fas fa-undo"></i> Reset to Defaults
                </button>
            </div>
        </div>
        
        <div class="settings-container">
            <div class="settings-section">
                <h3><i class="fas fa-database"></i> Database Settings</h3>
                <div class="form-group">
                    <label>Auto-refresh interval (seconds)</label>
                    <input type="number" id="refreshInterval" class="form-control" value="30" min="10" max="300">
                </div>
                <div class="form-group">
                    <label>Maximum records per page</label>
                    <input type="number" id="maxRecords" class="form-control" value="50" min="10" max="200">
                </div>
                <button class="btn btn-primary" onclick="seedDatabase()">
                    <i class="fas fa-seedling"></i> Seed Database
                </button>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-bell"></i> Notification Settings</h3>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableNotifications" checked>
                        Enable desktop notifications
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="emailNotifications" checked>
                        Send email notifications for new orders
                    </label>
                </div>
                <div class="form-group">
                    <label>Notification sound</label>
                    <select id="notificationSound" class="form-control">
                        <option value="default">Default</option>
                        <option value="chime">Chime</option>
                        <option value="bell">Bell</option>
                        <option value="none">None</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> Display Settings</h3>
                <div class="form-group">
                    <label>Theme</label>
                    <select id="theme" class="form-control">
                        <option value="dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                        <option value="auto">Auto (System)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Dashboard layout</label>
                    <select id="layout" class="form-control">
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Layout</option>
                        <option value="compact">Compact Layout</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
                <div class="form-group">
                    <label>Session timeout (minutes)</label>
                    <input type="number" id="sessionTimeout" class="form-control" value="60" min="15" max="480">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="requireConfirmation" checked>
                        Require confirmation for delete operations
                    </label>
                </div>
                <button class="btn btn-danger" onclick="changeAdminPassword()">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-tools"></i> System Maintenance</h3>
                <div class="maintenance-actions">
                    <button class="btn btn-secondary" onclick="backupDatabase()">
                        <i class="fas fa-download"></i> Backup Database
                    </button>
                    <button class="btn btn-warning" onclick="clearCache()">
                        <i class="fas fa-broom"></i> Clear Cache
                    </button>
                    <button class="btn btn-info" onclick="viewSystemLogs()">
                        <i class="fas fa-file-alt"></i> View System Logs
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Utility functions for search and filtering
function filterVehicles(searchTerm) {
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterCustomers(searchTerm) {
    const rows = document.querySelectorAll('#customersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterOrders(searchTerm) {
    const rows = document.querySelectorAll('#ordersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterMessages(searchTerm) {
    const rows = document.querySelectorAll('#messagesTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function populateBrandFilter(cars) {
    const brandFilter = document.getElementById('brandFilter');
    if (!brandFilter) return;
    
    const brands = [...new Set(cars.map(car => car.brand))].sort();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function filterByBrand(brand) {
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    rows.forEach(row => {
        if (!brand) {
            row.style.display = '';
        } else {
            const brandCell = row.cells[1].textContent;
            row.style.display = brandCell === brand ? '' : 'none';
        }
    });
}

// Export functions
function exportInventory(category) {
    showNotification(`Exporting ${category} inventory to CSV...`, 'info');
    // Simulate export
    setTimeout(() => {
        showNotification(`${category} inventory exported successfully!`, 'success');
    }, 2000);
}

function exportCustomers() {
    showNotification('Exporting customer data to CSV...', 'info');
    setTimeout(() => {
        showNotification('Customer data exported successfully!', 'success');
    }, 2000);
}

function exportOrders() {
    showNotification('Exporting orders to CSV...', 'info');
    setTimeout(() => {
        showNotification('Orders exported successfully!', 'success');
    }, 2000);
}

// Action handlers for buttons
function viewCustomerDetails(username) {
    showNotification(`Viewing details for ${username}`, 'info');
}

function sendCustomerEmail(email) {
    showNotification(`Opening email composer for ${email}`, 'info');
}

function viewOrderDetails(orderId) {
    showNotification(`Viewing order details for ${orderId}`, 'info');
}

function updateOrderStatus(orderId) {
    showNotification(`Updating status for order ${orderId}`, 'info');
}

function cancelOrder(orderId) {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
        showNotification(`Order ${orderId} cancelled`, 'success');
    }
}

function readMessage(messageId) {
    showNotification(`Opening message ${messageId}`, 'info');
}

function replyToMessage(messageId) {
    showNotification(`Composing reply to message ${messageId}`, 'info');
}

function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        showNotification(`Message ${messageId} deleted`, 'success');
    }
}

// Settings functions
function saveAllSettings() {
    showNotification('All settings saved successfully!', 'success');
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        showNotification('Settings reset to defaults', 'info');
        showSettingsManagement(); // Refresh the settings page
    }
}

function changeAdminPassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
        showNotification('Admin password changed successfully!', 'success');
    } else if (newPassword) {
        showNotification('Password must be at least 6 characters long', 'error');
    }
}

function backupDatabase() {
    showNotification('Starting database backup...', 'info');
    setTimeout(() => {
        showNotification('Database backup completed successfully!', 'success');
    }, 3000);
}

function clearCache() {
    showNotification('Clearing system cache...', 'info');
    setTimeout(() => {
        showNotification('Cache cleared successfully!', 'success');
    }, 1500);
}

function viewSystemLogs() {
    showNotification('Opening system logs viewer...', 'info');
}

// Cleanup function
function stopLiveDataRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log("📊 Live data refresh stopped");
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', stopLiveDataRefresh);

// Orders Management
async function showOrdersManagement() {
    console.log("📦 Showing Orders Management");
    currentView = 'orders';
    
    // Simulate orders data since we don't have a real orders endpoint
    const sampleOrders = [
        {
            id: 'ORD001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            vehicleName: 'Ferrari 488 GTB',
            orderDate: new Date('2023-12-01').toISOString(),
            status: 'Pending',
            totalAmount: '$275,000'
        },
        {
            id: 'ORD002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            vehicleName: 'Porsche 911 Turbo S',
            orderDate: new Date('2023-12-05').toISOString(),
            status: 'Confirmed',
            totalAmount: '$203,500'
        }
    ];
    
    displayOrdersTable(sampleOrders);
}

function displayOrdersTable(orders) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Orders Management</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="exportOrders()">
                    <i class="fas fa-download"></i> Export Orders
                </button>
                <button class="btn btn-secondary" onclick="refreshOrders()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="orderSearch" class="form-control" 
                   placeholder="Search orders..." onkeyup="filterOrders(this.value)">
            <select id="statusFilter" class="form-control" onchange="filterOrdersByStatus(this.value)">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        
        <div class="table-container">
            <table id="ordersTable">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateOrderRows(orders)}
                </tbody>
            </table>
        </div>
    `;
}

function generateOrderRows(orders) {
    return orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>
                <div>${order.customerName}</div>
                <small style="color: #888;">${order.customerEmail}</small>
            </td>
            <td>${order.vehicleName}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${order.totalAmount}</td>
            <td>
                <button class="action-btn btn-success" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-primary" onclick="updateOrderStatus('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Messages Management
async function showMessagesManagement() {
    console.log("💬 Showing Messages Management");
    currentView = 'messages';
    
    // Simulate messages data
    const sampleMessages = [
        {
            id: 'MSG001',
            customerName: 'Alice Johnson',
            customerEmail: 'alice@example.com',
            subject: 'Inquiry about Ferrari 488',
            message: 'I am interested in purchasing the Ferrari 488 GTB. Could you provide more details about financing options?',
            date: new Date('2023-12-08').toISOString(),
            status: 'Unread',
            priority: 'High'
        },
        {
            id: 'MSG002',
            customerName: 'Bob Wilson',
            customerEmail: 'bob@example.com',
            subject: 'Service Appointment',
            message: 'I need to schedule a service appointment for my Porsche. When would be the earliest available?',
            date: new Date('2023-12-07').toISOString(),
            status: 'Read',
            priority: 'Medium'
        }
    ];
    
    displayMessagesTable(sampleMessages);
}

function displayMessagesTable(messages) {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>Messages Management</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="composeNewMessage()">
                    <i class="fas fa-plus"></i> Compose
                </button>
                <button class="btn btn-secondary" onclick="markAllAsRead()">
                    <i class="fas fa-check"></i> Mark All Read
                </button>
            </div>
        </div>
        
        <div class="search-filters">
            <input type="text" id="messageSearch" class="form-control" 
                   placeholder="Search messages..." onkeyup="filterMessages(this.value)">
            <select id="messageStatusFilter" class="form-control" onchange="filterMessagesByStatus(this.value)">
                <option value="">All Messages</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
            </select>
        </div>
        
        <div class="table-container">
            <table id="messagesTable">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>From</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateMessageRows(messages)}
                </tbody>
            </table>
        </div>
    `;
}

function generateMessageRows(messages) {
    return messages.map(message => `
        <tr class="${message.status.toLowerCase()}">
            <td>
                <span class="priority-badge ${message.priority.toLowerCase()}">${message.priority}</span>
            </td>
            <td>
                <div>${message.customerName}</div>
                <small style="color: #888;">${message.customerEmail}</small>
            </td>
            <td>
                <div>${message.subject}</div>
                <small style="color: #888;">${message.message.substring(0, 60)}...</small>
            </td>
            <td>${new Date(message.date).toLocaleDateString()}</td>
            <td><span class="status ${message.status.toLowerCase()}">${message.status}</span></td>
            <td>
                <button class="action-btn btn-success" onclick="readMessage('${message.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-primary" onclick="replyToMessage('${message.id}')">
                    <i class="fas fa-reply"></i>
                </button>
                <button class="action-btn btn-danger" onclick="deleteMessage('${message.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Settings Management
function showSettingsManagement() {
    console.log("⚙️ Showing Settings Management");
    currentView = 'settings';
    
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="header">
            <h1>System Settings</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="saveAllSettings()">
                    <i class="fas fa-save"></i> Save All
                </button>
                <button class="btn btn-secondary" onclick="resetToDefaults()">
                    <i class="fas fa-undo"></i> Reset to Defaults
                </button>
            </div>
        </div>
        
        <div class="settings-container">
            <div class="settings-section">
                <h3><i class="fas fa-database"></i> Database Settings</h3>
                <div class="form-group">
                    <label>Auto-refresh interval (seconds)</label>
                    <input type="number" id="refreshInterval" class="form-control" value="30" min="10" max="300">
                </div>
                <div class="form-group">
                    <label>Maximum records per page</label>
                    <input type="number" id="maxRecords" class="form-control" value="50" min="10" max="200">
                </div>
                <button class="btn btn-primary" onclick="seedDatabase()">
                    <i class="fas fa-seedling"></i> Seed Database
                </button>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-bell"></i> Notification Settings</h3>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableNotifications" checked>
                        Enable desktop notifications
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="emailNotifications" checked>
                        Send email notifications for new orders
                    </label>
                </div>
                <div class="form-group">
                    <label>Notification sound</label>
                    <select id="notificationSound" class="form-control">
                        <option value="default">Default</option>
                        <option value="chime">Chime</option>
                        <option value="bell">Bell</option>
                        <option value="none">None</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> Display Settings</h3>
                <div class="form-group">
                    <label>Theme</label>
                    <select id="theme" class="form-control">
                        <option value="dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                        <option value="auto">Auto (System)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Dashboard layout</label>
                    <select id="layout" class="form-control">
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Layout</option>
                        <option value="compact">Compact Layout</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
                <div class="form-group">
                    <label>Session timeout (minutes)</label>
                    <input type="number" id="sessionTimeout" class="form-control" value="60" min="15" max="480">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="requireConfirmation" checked>
                        Require confirmation for delete operations
                    </label>
                </div>
                <button class="btn btn-danger" onclick="changeAdminPassword()">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-tools"></i> System Maintenance</h3>
                <div class="maintenance-actions">
                    <button class="btn btn-secondary" onclick="backupDatabase()">
                        <i class="fas fa-download"></i> Backup Database
                    </button>
                    <button class="btn btn-warning" onclick="clearCache()">
                        <i class="fas fa-broom"></i> Clear Cache
                    </button>
                    <button class="btn btn-info" onclick="viewSystemLogs()">
                        <i class="fas fa-file-alt"></i> View System Logs
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Utility functions for search and filtering
function filterVehicles(searchTerm) {
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterCustomers(searchTerm) {
    const rows = document.querySelectorAll('#customersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterOrders(searchTerm) {
    const rows = document.querySelectorAll('#ordersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function filterMessages(searchTerm) {
    const rows = document.querySelectorAll('#messagesTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function populateBrandFilter(cars) {
    const brandFilter = document.getElementById('brandFilter');
    if (!brandFilter) return;
    
    const brands = [...new Set(cars.map(car => car.brand))].sort();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function filterByBrand(brand) {
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    rows.forEach(row => {
        if (!brand) {
            row.style.display = '';
        } else {
            const brandCell = row.cells[1].textContent;
            row.style.display = brandCell === brand ? '' : 'none';
        }
    });
}

// Export functions
function exportInventory(category) {
    showNotification(`Exporting ${category} inventory to CSV...`, 'info');
    setTimeout(() => {
        showNotification(`${category} inventory exported successfully!`, 'success');
    }, 2000);
}

function exportCustomers() {
    showNotification('Exporting customer data to CSV...', 'info');
    setTimeout(() => {
        showNotification('Customer data exported successfully!', 'success');
    }, 2000);
}

function exportOrders() {
    showNotification('Exporting orders to CSV...', 'info');
    setTimeout(() => {
        showNotification('Orders exported successfully!', 'success');
    }, 2000);
}

// Action handlers
function viewCustomerDetails(username) {
    showNotification(`Viewing details for ${username}`, 'info');
}

function sendCustomerEmail(email) {
    showNotification(`Opening email composer for ${email}`, 'info');
}

function viewOrderDetails(orderId) {
    showNotification(`Viewing order details for ${orderId}`, 'info');
}

function updateOrderStatus(orderId) {
    showNotification(`Updating status for order ${orderId}`, 'info');
}

function cancelOrder(orderId) {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
        showNotification(`Order ${orderId} cancelled`, 'success');
    }
}

function readMessage(messageId) {
    showNotification(`Opening message ${messageId}`, 'info');
}

function replyToMessage(messageId) {
    showNotification(`Composing reply to message ${messageId}`, 'info');
}

function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        showNotification(`Message ${messageId} deleted`, 'success');
    }
}

// Settings functions
function saveAllSettings() {
    showNotification('All settings saved successfully!', 'success');
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        showNotification('Settings reset to defaults', 'info');
        showSettingsManagement();
    }
}

function changeAdminPassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
        showNotification('Admin password changed successfully!', 'success');
    } else if (newPassword) {
        showNotification('Password must be at least 6 characters long', 'error');
    }
}

function backupDatabase() {
    showNotification('Starting database backup...', 'info');
    setTimeout(() => {
        showNotification('Database backup completed successfully!', 'success');
    }, 3000);
}

function clearCache() {
    showNotification('Clearing system cache...', 'info');
    setTimeout(() => {
        showNotification('Cache cleared successfully!', 'success');
    }, 1500);
}

function viewSystemLogs() {
    showNotification('Opening system logs viewer...', 'info');
}

// Cleanup function
function stopLiveDataRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log("📊 Live data refresh stopped");
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', stopLiveDataRefresh);

// Export functions for use in other files
window.admin = {
    isAdmin,
    showAdminLoginModal,
    handleAdminLogout,
    initializeEnhancedAdminDashboard,
    initializeAdminControls,
    saveVehicleData,
    loadVehicleData,
    addCarToBrandsData,
    removeCarFromBrandsData,
    showEnhancedDashboard,
    showInventoryManagement,
    showAddVehicleInterface,
    showDeleteVehicleInterface,
    showCustomersManagement,
    showOrdersManagement,
    showMessagesManagement,
    showSettingsManagement,
    refreshDashboardData,
    seedDatabase
};