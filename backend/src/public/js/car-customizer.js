class CarCustomizer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.carModel = null;
        this.selectedOptions = {
            color: null,
            wheels: null,
            interior: null,
            features: []
        };
        this.basePrice = parseFloat(document.querySelector('.base-price span:last-child').textContent.replace('$', '').replace(',', ''));
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.8);
        this.renderer.setClearColor(0xf5f5f5);
        document.getElementById('car-model').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(5, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Load car model
        this.loadCarModel();

        // Start animation loop
        this.animate();
    }

    loadCarModel() {
        const loader = new THREE.GLTFLoader();
        const carId = window.location.pathname.split('/').pop();
        
        // Load the car model
        loader.load(`/models/cars/${carId}.glb`, (gltf) => {
            this.carModel = gltf.scene;
            this.scene.add(this.carModel);
            
            // Center the model
            const box = new THREE.Box3().setFromObject(this.carModel);
            const center = box.getCenter(new THREE.Vector3());
            this.carModel.position.sub(center);
            
            // Scale the model if needed
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            this.carModel.scale.set(scale, scale, scale);
        });
    }

    setupEventListeners() {
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.updateCarColor(color);
                this.updatePrice();
            });
        });

        // Wheel selection
        document.querySelectorAll('.wheel-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const wheelId = e.target.closest('.wheel-option').dataset.wheel;
                this.updateWheels(wheelId);
                this.updatePrice();
            });
        });

        // Interior selection
        document.querySelectorAll('.interior-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const interiorId = e.target.closest('.interior-option').dataset.interior;
                this.updateInterior(interiorId);
                this.updatePrice();
            });
        });

        // Feature selection
        document.querySelectorAll('.feature-option input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const featureId = e.target.dataset.feature;
                this.updateFeatures(featureId, e.target.checked);
                this.updatePrice();
            });
        });

        // Viewer controls
        document.getElementById('rotate-left').addEventListener('click', () => this.rotateModel(-Math.PI / 4));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotateModel(Math.PI / 4));
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomModel(0.5));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomModel(-0.5));
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());

        // Save configuration
        document.getElementById('save-config').addEventListener('click', () => this.saveConfiguration());
        
        // Request quote
        document.getElementById('request-quote').addEventListener('click', () => this.requestQuote());

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    updateCarColor(color) {
        if (!this.carModel) return;
        
        this.carModel.traverse((child) => {
            if (child.isMesh && child.material.name === 'body') {
                child.material.color.set(color);
            }
        });
        
        this.selectedOptions.color = color;
    }

    updateWheels(wheelId) {
        // Update wheel model
        if (!this.carModel) return;
        
        this.carModel.traverse((child) => {
            if (child.isMesh && child.material.name === 'wheels') {
                // Update wheel material/texture
                // This would need to be implemented based on your wheel models
            }
        });
        
        this.selectedOptions.wheels = wheelId;
    }

    updateInterior(interiorId) {
        // Update interior model
        if (!this.carModel) return;
        
        this.carModel.traverse((child) => {
            if (child.isMesh && child.material.name === 'interior') {
                // Update interior material/texture
                // This would need to be implemented based on your interior models
            }
        });
        
        this.selectedOptions.interior = interiorId;
    }

    updateFeatures(featureId, enabled) {
        if (enabled) {
            this.selectedOptions.features.push(featureId);
        } else {
            this.selectedOptions.features = this.selectedOptions.features.filter(id => id !== featureId);
        }
    }

    updatePrice() {
        let optionsTotal = 0;
        
        // Calculate options price
        if (this.selectedOptions.wheels) {
            const wheelPrice = parseFloat(document.querySelector(`[data-wheel="${this.selectedOptions.wheels}"] .wheel-price`).textContent.replace('+$', '').replace(',', ''));
            optionsTotal += wheelPrice;
        }
        
        if (this.selectedOptions.interior) {
            const interiorPrice = parseFloat(document.querySelector(`[data-interior="${this.selectedOptions.interior}"] .interior-price`).textContent.replace('+$', '').replace(',', ''));
            optionsTotal += interiorPrice;
        }
        
        this.selectedOptions.features.forEach(featureId => {
            const featurePrice = parseFloat(document.querySelector(`[data-feature="${featureId}"] .feature-price`).textContent.replace('+$', '').replace(',', ''));
            optionsTotal += featurePrice;
        });
        
        // Update price display
        document.getElementById('options-total').textContent = `$${optionsTotal.toLocaleString()}`;
        document.getElementById('total-price').textContent = `$${(this.basePrice + optionsTotal).toLocaleString()}`;
    }

    rotateModel(angle) {
        if (!this.carModel) return;
        this.carModel.rotation.y += angle;
    }

    zoomModel(delta) {
        if (!this.camera) return;
        this.camera.position.z += delta;
    }

    resetView() {
        if (!this.camera || !this.carModel) return;
        this.camera.position.set(5, 2, 5);
        this.camera.lookAt(0, 0, 0);
        this.carModel.rotation.set(0, 0, 0);
    }

    async saveConfiguration() {
        try {
            const response = await fetch('/api/cars/customize/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    carId: window.location.pathname.split('/').pop(),
                    configuration: this.selectedOptions
                })
            });
            
            if (response.ok) {
                alert('Configuration saved successfully!');
            } else {
                throw new Error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('Failed to save configuration. Please try again.');
        }
    }

    async requestQuote() {
        try {
            const response = await fetch('/api/cars/customize/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    carId: window.location.pathname.split('/').pop(),
                    configuration: this.selectedOptions
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                alert(`Quote requested successfully! Your quote ID is: ${data.quoteId}`);
            } else {
                throw new Error('Failed to request quote');
            }
        } catch (error) {
            console.error('Error requesting quote:', error);
            alert('Failed to request quote. Please try again.');
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.8);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the customizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CarCustomizer();
}); 