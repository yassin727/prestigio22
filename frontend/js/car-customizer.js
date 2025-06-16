// Car Customizer Simple JavaScript
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initModel, 1500);
});

// Global variables
let scene, camera, renderer, controls, currentModel;
let currentConfig = {
    color: '#000000',
    finish: 'metallic',
    wheels: 'standard',
    interior: 'leather-black',
    basePrice: 4200000
};

// Available car models with their paths and info
const availableModels = {
    // ACTUAL 3D MODELS AVAILABLE
    'bugatti-bolide': {
        name: 'Bugatti Bolide 2024',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb',
        price: 4200000,
        description: 'Ultimate track-focused hypercar',
        hasModel: true
    },
    'mercedes-s-class': {
        name: 'Mercedes-Benz S-Class Maybach',
        path: '/models/mercedes/2021_mercedes-benz_s-class_maybach.glb',
        price: 185000,
        description: 'Luxury redefined',
        hasModel: true
    },
    'mercedes-c-class': {
        name: 'Mercedes-Benz C220',
        path: '/models/mercedes/mercedes-_benz_w206_c220.glb',
        price: 45000,
        description: 'Compact luxury sedan',
        hasModel: true
    },
    'bmw-x6m': {
        name: 'BMW X6M Competition',
        path: '/models/bmw/bmw_x6m_competition_assetto__www.vecarz.com.glb',
        price: 120000,
        description: 'High-performance luxury SUV',
        hasModel: true
    },
    'bmw-m8': {
        name: 'BMW M8 Competition Convertible',
        path: '/models/bmw/bmw_m8_competition_convertible_f93.glb',
        price: 140000,
        description: 'Ultimate driving machine',
        hasModel: true
    },
    'porsche-911': {
        name: 'Porsche 911 Carrera 4S Cabriolet',
        path: '/models/porshce/2019_porsche_911_carrera_4s_cabriolet_992.glb',
        price: 216000,
        description: 'Iconic sports car perfection',
        hasModel: true
    },
    'porsche-cayenne': {
        name: 'Porsche Cayenne Turbo Coupe',
        path: '/models/porshce/2020_porsche_cayenne_turbo_coupe.glb',
        price: 180000,
        description: 'Luxury performance SUV',
        hasModel: true
    },
    
    // PLACEHOLDER MODELS (using Bugatti as fallback)
    'ferrari-sf90': {
        name: 'Ferrari SF90 Stradale',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 625000,
        description: 'Hybrid V8 supercar',
        hasModel: false,
        placeholder: true
    },
    'ferrari-f8': {
        name: 'Ferrari F8 Tributo',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 276000,
        description: 'Pure V8 excellence',
        hasModel: false,
        placeholder: true
    },
    'lamborghini-aventador': {
        name: 'Lamborghini Aventador',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 500000,
        description: 'V12 flagship supercar',
        hasModel: false,
        placeholder: true
    },
    'lamborghini-huracan': {
        name: 'Lamborghini Huracán',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 260000,
        description: 'V10 precision machine',
        hasModel: false,
        placeholder: true
    },
    'mclaren-720s': {
        name: 'McLaren 720S',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 299000,
        description: 'British engineering excellence',
        hasModel: false,
        placeholder: true
    },
    'rolls-phantom': {
        name: 'Rolls-Royce Phantom',
        path: '/models/mercedes/2021_mercedes-benz_s-class_maybach.glb', // placeholder (luxury sedan)
        price: 450000,
        description: 'Ultimate luxury experience',
        hasModel: false,
        placeholder: true
    },
    'bentley-continental': {
        name: 'Bentley Continental GT',
        path: '/models/mercedes/2021_mercedes-benz_s-class_maybach.glb', // placeholder
        price: 220000,
        description: 'Grand touring perfection',
        hasModel: false,
        placeholder: true
    },
    'aston-dbs': {
        name: 'Aston Martin DBS Superleggera',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 316000,
        description: 'British grand tourer',
        hasModel: false,
        placeholder: true
    },
    'maserati-mc20': {
        name: 'Maserati MC20',
        path: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // placeholder
        price: 212000,
        description: 'Italian racing heritage',
        hasModel: false,
        placeholder: true
    },
    'jaguar-ftype': {
        name: 'Jaguar F-Type',
        path: '/models/porshce/2019_porsche_911_carrera_4s_cabriolet_992.glb', // placeholder (sports car)
        price: 103000,
        description: 'British sports car elegance',
        hasModel: false,
        placeholder: true
    },
    'lexus-lc500': {
        name: 'Lexus LC 500',
        path: '/models/porshce/2019_porsche_911_carrera_4s_cabriolet_992.glb', // placeholder
        price: 93000,
        description: 'Japanese luxury coupe',
        hasModel: false,
        placeholder: true
    },
    'land-rover-vogue': {
        name: 'Land Rover Range Rover Vogue',
        path: '/models/bmw/bmw_x6m_competition_assetto__www.vecarz.com.glb', // placeholder (SUV)
        price: 120000,
        description: 'Luxury off-road capability',
        hasModel: false,
        placeholder: true
    }
};

// Parse price from string format like "$625,000+" or "$2.5 million+"
function parseCarPrice(priceString) {
    if (!priceString) return 100000; // default fallback
    
    // Remove $ and + signs, convert to lowercase
    let cleanPrice = priceString.replace(/[$+]/g, '').toLowerCase().trim();
    
    // Handle million format
    if (cleanPrice.includes('million')) {
        const millions = parseFloat(cleanPrice.replace(/[^0-9.]/g, ''));
        return millions * 1000000;
    }
    
    // Handle regular format like "625,000"
    const regularPrice = parseInt(cleanPrice.replace(/[^0-9]/g, ''));
    
    // If the price is less than 10000, assume it's in thousands (e.g., "625" means $625,000)
    if (regularPrice < 10000) {
        return regularPrice * 1000;
    }
    
    // Otherwise, it's already the full price
    return regularPrice;
}

// Get selected car from URL parameters
function getSelectedCar() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car') || urlParams.get('id'); // Check both 'car' and 'id' parameters
    const carName = urlParams.get('name');
    const carBrand = urlParams.get('brand');
    const carPrice = urlParams.get('price');
    
    // If we have a valid car ID and it exists in our models, update it with URL params if provided
    if (carId && availableModels[carId]) {
        // Update the existing model with actual car name/brand if provided
        if (carName && carBrand) {
            availableModels[carId].name = `${carBrand} ${carName}`;
            availableModels[carId].actualName = carName;
            availableModels[carId].actualBrand = carBrand;
            
            // Update price if provided
            if (carPrice) {
                const priceNum = parseCarPrice(carPrice);
                if (!isNaN(priceNum) && priceNum > 0) {
                    availableModels[carId].price = priceNum;
                }
            }
        }
        return carId;
    }
    
    // If no valid car ID but we have name/brand, create a custom entry
    if (carName && carBrand) {
        // First try to find if the carId matches our expected format
        const tempCarId = carId || `${carBrand.toLowerCase().replace(/\s+/g, '-')}-${carName.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Check if a specific model exists for this car
        const possibleModelPath = `/models/${carBrand.toLowerCase().replace(/\s+/g, '-')}/${carName.toLowerCase().replace(/\s+/g, '-')}.glb`;
        
        availableModels[tempCarId] = {
            name: `${carBrand} ${carName}`,
            actualName: carName,
            actualBrand: carBrand,
            path: possibleModelPath, // Try specific model first
            fallbackPath: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb', // fallback model
            price: parseCarPrice(carPrice) || 100000,
            description: `Luxury ${carBrand} vehicle - Premium automotive excellence`,
            hasModel: false,
            placeholder: true,
            isCustom: true
        };
        
        return tempCarId;
    }
    
    // Final fallback
    return 'bugatti-bolide';
}

function initModel() {
    const modelViewer = document.getElementById('model-viewer');
    const modelLoading = document.querySelector('.model-loading');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Get selected car
    const selectedCarId = getSelectedCar();
    const selectedCar = availableModels[selectedCarId];
    
    console.log('🚗 Selected Car:', selectedCarId, selectedCar);
    console.log('💰 Base Price:', selectedCar.price, 'formatted:', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedCar.price));
    
    // Update UI with selected car info
    document.getElementById('car-model-name').textContent = selectedCar.name;
    document.getElementById('car-model-description').textContent = selectedCar.description;
    currentConfig.basePrice = selectedCar.price;
    updatePrice();
    
    // Update page title if we have actual car name
    if (selectedCar.actualName && selectedCar.actualBrand) {
        document.title = `Customize ${selectedCar.actualBrand} ${selectedCar.actualName} - Prestigio Motors`;
    }
    
    // Show placeholder notification if needed
    if (selectedCar.placeholder || selectedCar.isCustom) {
        if (selectedCar.isCustom) {
            showPlaceholderNotification(`${selectedCar.name} - 3D model not available. Using placeholder for customization preview.`);
        } else {
            showPlaceholderNotification(selectedCar.name);
        }
    }

    // Create Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        modelViewer.clientWidth / modelViewer.clientHeight,
        0.1,
        1000
    );
    camera.position.set(5, 2, 5);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    modelViewer.appendChild(renderer.domElement);

    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Setup lighting
    setupLighting();

    // Load the 3D model
    loadCarModel(selectedCar);

    // Setup event listeners
    setupEventListeners();

    // Start animation loop
    animate();

    // Hide loading overlay
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 2000);
}

function loadCarModel(carData) {
    const loader = new THREE.GLTFLoader();
    const modelPath = carData.path;
    
    console.log('🔄 Loading model:', modelPath);
    
    // Function to actually load and display the model
    function displayModel(gltf, isSpecificModel = true) {
        console.log(`✅ Model loaded successfully (${isSpecificModel ? 'specific' : 'fallback'})`);
        
        // Remove existing model
        if (currentModel) {
            scene.remove(currentModel);
        }
        
        currentModel = gltf.scene;
        
        // Scale and position the model
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        currentModel.position.sub(center);
        
        // Scale to fit
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        currentModel.scale.set(scale, scale, scale);
        
        // Enable shadows
        currentModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(currentModel);
        
        // Apply initial color and finish
        updateCarColor(currentConfig.color, currentConfig.finish);
        
        // Show notification if using fallback
        if (!isSpecificModel && carData.isCustom) {
            showPlaceholderNotification(`${carData.name} - Using preview model for customization. Actual vehicle available at showroom.`);
        }
    }
    
    // Try to load the specific model first
    loader.load(
        modelPath,
        function(gltf) {
            displayModel(gltf, true);
        },
        function(progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.log('⚠️ Specific model not found, trying fallback:', error.message);
            
            // If specific model fails and we have a fallback, try that
            if (carData.fallbackPath && carData.fallbackPath !== modelPath) {
                console.log('🔄 Loading fallback model:', carData.fallbackPath);
                loader.load(
                    carData.fallbackPath,
                    function(gltf) {
                        displayModel(gltf, false);
                    },
                    function(progress) {
                        console.log('Fallback loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    function(fallbackError) {
                        console.error('❌ Error loading fallback model:', fallbackError);
                        showNotification('Failed to load 3D model. Please try refreshing the page.', 'error');
                    }
                );
            } else {
                console.error('❌ Error loading model:', error);
                showNotification('Failed to load 3D model. Please try refreshing the page.', 'error');
            }
        }
    );
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Fill lights
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight1.position.set(-10, 5, -5);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight2.position.set(0, -10, 10);
    scene.add(fillLight2);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    rimLight.position.set(-5, 5, -10);
    scene.add(rimLight);
}

function createCarPaintMaterial(color, finish) {
    const baseColor = new THREE.Color(color);
    
    let material;
    
    switch(finish) {
        case 'matte':
            material = new THREE.MeshLambertMaterial({
                color: baseColor,
                roughness: 1.0,
                metalness: 0.0
            });
            break;
            
        case 'chrome':
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.0,
                metalness: 1.0,
                envMapIntensity: 2.0
            });
            break;
            
        case 'satin':
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.4,
                metalness: 0.8
            });
            break;
            
        case 'gloss':
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.1,
                metalness: 0.9
            });
            break;
            
        default: // metallic
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.3,
                metalness: 0.7
            });
    }
    
    return material;
}

function updateCarColor(color, finish) {
    if (!currentModel) return;
    
    const material = createCarPaintMaterial(color, finish);
    
    currentModel.traverse(function(child) {
        if (child.isMesh && child.material) {
            // Apply to car body materials (skip glass, chrome, lights, etc.)
            const materialName = child.material.name || '';
            const meshName = child.name || '';
            
            // Skip materials/meshes that are likely glass, chrome, lights, or interior
            if (!materialName.toLowerCase().includes('glass') && 
                !materialName.toLowerCase().includes('chrome') && 
                !materialName.toLowerCase().includes('light') &&
                !materialName.toLowerCase().includes('interior') &&
                !meshName.toLowerCase().includes('glass') &&
                !meshName.toLowerCase().includes('chrome') &&
                !meshName.toLowerCase().includes('light') &&
                !meshName.toLowerCase().includes('interior')) {
                
                // Apply the new material
                if (Array.isArray(child.material)) {
                    // Handle multi-material objects
                    child.material = child.material.map(() => material.clone());
                } else {
                    child.material = material.clone();
                }
            }
        }
    });
    
    console.log(`🎨 Applied ${color} ${finish} finish to car model`);
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            selectColor(color);
        });
    });

    // Finish selection
    document.querySelectorAll('.finish-option').forEach(option => {
        option.addEventListener('click', function() {
            const finish = this.getAttribute('data-finish');
            selectFinish(finish);
        });
    });

    // Wheel selection
    document.querySelectorAll('.wheel-option').forEach(option => {
        option.addEventListener('click', function() {
            const wheel = this.getAttribute('data-wheel');
            selectWheel(wheel);
        });
    });

    // Interior selection
    document.querySelectorAll('.interior-option').forEach(option => {
        option.addEventListener('click', function() {
            const interior = this.getAttribute('data-interior');
            selectInterior(interior);
        });
    });

    // Performance/Feature selection
    document.querySelectorAll('.feature-option').forEach(option => {
        option.addEventListener('click', function() {
            const feature = this.getAttribute('data-feature');
            selectPerformance(feature);
        });
    });

    // Technology features (checkboxes)
    document.querySelectorAll('.tech-feature input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePrice);
    });

    // Exterior features (checkboxes)
    document.querySelectorAll('.exterior-feature input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePrice);
    });

    // View angle buttons
    document.querySelectorAll('.angle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const angle = this.getAttribute('data-angle');
            setViewAngle(angle);
            
            // Update active state
            document.querySelectorAll('.angle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Control buttons
    document.getElementById('autoRotateBtn')?.addEventListener('click', toggleAutoRotate);
    document.getElementById('resetViewBtn')?.addEventListener('click', resetView);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);

    // Action buttons
    document.getElementById('resetBtn')?.addEventListener('click', resetConfiguration);
    document.getElementById('saveBtn')?.addEventListener('click', saveConfiguration);
    
    // Purchase button
    document.getElementById('purchaseBtn')?.addEventListener('click', handlePurchase);

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.customization-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${tabName}-section`)?.classList.add('active');
}

function selectColor(color) {
    currentConfig.color = color;
    updateCarColor(color, currentConfig.finish);
    updatePrice();
    
    // Update UI
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-color="${color}"]`)?.classList.add('active');
    
    showNotification('Color updated successfully!', 'success');
}

function selectFinish(finish) {
    currentConfig.finish = finish;
    updateCarColor(currentConfig.color, finish);
    updatePrice();
    
    // Update UI
    document.querySelectorAll('.finish-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-finish="${finish}"]`)?.classList.add('active');
    
    showNotification('Finish updated successfully!', 'success');
}

function selectWheel(wheel) {
    currentConfig.wheels = wheel;
    updatePrice();
    
    // Update UI
    document.querySelectorAll('.wheel-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-wheel="${wheel}"]`)?.classList.add('active');
    
    showNotification('Wheels updated successfully!', 'success');
}

function selectInterior(interior) {
    currentConfig.interior = interior;
    updatePrice();
    
    // Update UI
    document.querySelectorAll('.interior-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-interior="${interior}"]`)?.classList.add('active');
    
    showNotification('Interior updated successfully!', 'success');
}

function selectPerformance(feature) {
    currentConfig.performance = feature;
    updatePrice();
    
    // Update UI
    document.querySelectorAll('.feature-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-feature="${feature}"]`)?.classList.add('active');
    
    showNotification('Performance package updated!', 'success');
}

function updatePrice() {
    let totalPrice = currentConfig.basePrice;
    
    // Add wheel upgrade costs
    const wheelPrices = {
        'sport': 2500,
        'carbon': 8500,
        'forged': 12000,
        'chrome': 5500
    };
    
    if (currentConfig.wheels && wheelPrices[currentConfig.wheels]) {
        totalPrice += wheelPrices[currentConfig.wheels];
    }
    
    // Add interior upgrade costs
    const interiorPrices = {
        'leather-beige': 1500,
        'leather-red': 2000,
        'alcantara': 3000,
        'carbon-fiber': 8000,
        'luxury-white': 2500
    };
    
    if (currentConfig.interior && interiorPrices[currentConfig.interior]) {
        totalPrice += interiorPrices[currentConfig.interior];
    }
    
    // Add performance package costs
    const performancePrices = {
        'performance-sport': 15000,
        'performance-track': 35000
    };
    
    if (currentConfig.performance && performancePrices[currentConfig.performance]) {
        totalPrice += performancePrices[currentConfig.performance];
    }
    
    // Add technology features
    document.querySelectorAll('.tech-feature input[type="checkbox"]:checked').forEach(checkbox => {
        const techPrices = {
            'premium-audio': 3500,
            'heads-up-display': 2200,
            'adaptive-cruise': 1800,
            'night-vision': 4500
        };
        
        const techId = checkbox.id;
        if (techPrices[techId]) {
            totalPrice += techPrices[techId];
        }
    });
    
    // Add exterior features
    document.querySelectorAll('.exterior-feature input[type="checkbox"]:checked').forEach(checkbox => {
        const exteriorPrices = {
            'carbon-spoiler': 6500,
            'ceramic-coating': 2800,
            'tinted-windows': 1200
        };
        
        const exteriorId = checkbox.id;
        if (exteriorPrices[exteriorId]) {
            totalPrice += exteriorPrices[exteriorId];
        }
    });
    
    // Update price display
    const priceElement = document.getElementById('total-price');
    if (priceElement) {
        priceElement.textContent = `$${totalPrice.toLocaleString()}`;
    }
    
    currentConfig.totalPrice = totalPrice;
}

function toggleAutoRotate() {
    if (controls) {
        controls.autoRotate = !controls.autoRotate;
        const btn = document.getElementById('autoRotateBtn');
        if (btn) {
            btn.classList.toggle('active');
        }
    }
}

function resetView() {
    if (camera && controls) {
        camera.position.set(5, 2, 5);
        controls.reset();
    }
}

function toggleFullscreen() {
    const modelViewer = document.getElementById('model-viewer');
    if (!document.fullscreenElement) {
        modelViewer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function setViewAngle(angle) {
    if (!camera || !controls) return;
    
    const distance = 8;
    
    switch(angle) {
        case 'front':
            camera.position.set(0, 2, distance);
            break;
        case 'side':
            camera.position.set(distance, 2, 0);
            break;
        case 'rear':
            camera.position.set(0, 2, -distance);
            break;
        case 'top':
            camera.position.set(0, distance, 0);
            break;
    }
    
    controls.update();
}

function resetConfiguration() {
    // Reset to defaults
    currentConfig = {
        color: '#000000',
        finish: 'metallic',
        wheels: 'standard',
        interior: 'leather-black',
        basePrice: currentConfig.basePrice
    };
    
    // Reset UI
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-color="#000000"]')?.classList.add('active');
    
    document.querySelectorAll('.finish-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-finish="metallic"]')?.classList.add('active');
    
    document.querySelectorAll('.wheel-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-wheel="standard"]')?.classList.add('active');
    
    document.querySelectorAll('.interior-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-interior="leather-black"]')?.classList.add('active');
    
    document.querySelectorAll('.feature-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-feature="performance-standard"]')?.classList.add('active');
    
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Update model and price
    updateCarColor(currentConfig.color, currentConfig.finish);
    updatePrice();
    
    showNotification('Configuration reset to defaults', 'info');
}

function saveConfiguration() {
    const selectedCarId = getSelectedCar();
    const selectedCar = availableModels[selectedCarId];
    
    const config = {
        carId: selectedCarId,
        carName: selectedCar.name,
        basePrice: currentConfig.basePrice,
        totalPrice: currentConfig.totalPrice,
        options: {
            color: currentConfig.color,
            finish: currentConfig.finish,
            wheels: currentConfig.wheels,
            interior: currentConfig.interior,
            performance: currentConfig.performance
        },
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('carConfiguration', JSON.stringify(config));
    
    showNotification('Configuration saved successfully!', 'success');
    console.log('💾 Configuration saved:', config);
}

function handlePurchase() {
    const selectedCarId = getSelectedCar();
    const selectedCar = availableModels[selectedCarId];
    
    // Save current configuration
    saveConfiguration();
    
    // Prepare purchase data
    const purchaseData = {
        carId: selectedCarId,
        carName: selectedCar.name,
        basePrice: currentConfig.basePrice,
        totalPrice: currentConfig.totalPrice || currentConfig.basePrice,
        options: {
            color: currentConfig.color,
            finish: currentConfig.finish,
            wheels: currentConfig.wheels,
            interior: currentConfig.interior,
            performance: currentConfig.performance
        },
        selectedFeatures: [],
        timestamp: new Date().toISOString(),
        isPlaceholder: selectedCar.placeholder || false
    };
    
    // Collect selected technology features
    document.querySelectorAll('.tech-feature input[type="checkbox"]:checked').forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        purchaseData.selectedFeatures.push({
            type: 'technology',
            name: label ? label.textContent : checkbox.id,
            id: checkbox.id
        });
    });
    
    // Collect selected exterior features
    document.querySelectorAll('.exterior-feature input[type="checkbox"]:checked').forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        purchaseData.selectedFeatures.push({
            type: 'exterior',
            name: label ? label.textContent : checkbox.id,
            id: checkbox.id
        });
    });
    
    // Store purchase data for customer service page
    localStorage.setItem('purchaseData', JSON.stringify(purchaseData));
    
    console.log('🛒 Purchase data prepared:', purchaseData);
    
    // Show confirmation message
    showNotification('Redirecting to customer service for appointment booking...', 'info');
    
    // Redirect to customer service page
    setTimeout(() => {
        window.location.href = '/pages/customerservice.html?purchase=true';
    }, 2000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showPlaceholderNotification(carName) {
    const message = `Note: This is a preview using a similar vehicle model. The actual ${carName} will be available for viewing at our showroom.`;
    showNotification(message, 'info');
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const modelViewer = document.getElementById('model-viewer');
    if (!modelViewer || !camera || !renderer) return;
    
    camera.aspect = modelViewer.clientWidth / modelViewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
} 