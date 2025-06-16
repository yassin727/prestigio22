// Car customization data
const carModels = {
    // Template for adding new car models
    'template': {
        name: 'Car Name',
        basePrice: 0,
        description: 'Car description',
        category: 'luxury', // luxury, sports, suv, etc.
        modelPath: '/models/cars/template.glb', // Path to 3D model
        thumbnail: '/images/cars/template.jpg', // Path to thumbnail image
        options: {
            exterior: {
                colors: [
                    { name: 'Color Name', price: 0, color: '#HEXCODE' }
                ],
                carbonFiber: [
                    { name: 'None', price: 0 },
                    { name: 'Roof', price: 5000 },
                    { name: 'Hood', price: 4000 },
                    { name: 'Full Package', price: 15000 }
                ],
                windowTint: [
                    { name: 'None', price: 0, opacity: 1 },
                    { name: 'Light', price: 1000, opacity: 0.7 },
                    { name: 'Medium', price: 1500, opacity: 0.5 },
                    { name: 'Dark', price: 2000, opacity: 0.3 }
                ]
            },
            wheels: {
                styles: [
                    { name: 'Standard', price: 0, size: 19 }
                ],
                colors: [
                    { name: 'Silver', price: 0 },
                    { name: 'Black', price: 1000 },
                    { name: 'Chrome', price: 2000 },
                    { name: 'Gold', price: 3000 }
                ]
            },
            interior: {
                materials: [
                    { name: 'Leather', price: 0 }
                ],
                colors: [
                    { name: 'Black', price: 0 }
                ],
                trim: [
                    { name: 'Wood', price: 0 }
                ]
            },
            performance: {
                exhaust: [
                    { name: 'Standard', price: 0, sound: 'quiet' }
                ],
                suspension: [
                    { name: 'Comfort', price: 0 }
                ]
            },
            features: {
                audio: [
                    { name: 'Standard', price: 0, speakers: 8 }
                ],
                technology: [
                    { name: 'Standard', price: 0 }
                ],
                safety: [
                    { name: 'Standard', price: 0 }
                ]
            }
        },
        performance: {
            base: {
                acceleration: 0,
                topSpeed: 0,
                handling: 0,
                fuelEfficiency: 0
            },
            modifiers: {
                exhaust: {
                    'Standard': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 }
                },
                suspension: {
                    'Comfort': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 }
                }
            }
        }
    },

    // Example car models
    'mercedes-s-class': {
        name: 'Mercedes-Benz S-Class',
        basePrice: 150000,
        description: 'The pinnacle of luxury and technology',
        category: 'luxury',
        modelPath: '/models/cars/mercedes-s-class.glb',
        thumbnail: '/images/cars/mercedes-s-class.jpg',
        options: {
            exterior: {
                colors: [
                    { name: 'Obsidian Black', price: 0, color: '#000000' },
                    { name: 'Diamond White', price: 2000, color: '#FFFFFF' },
                    { name: 'Selenite Grey', price: 1500, color: '#808080' },
                    { name: 'Ruby Red', price: 2500, color: '#FF0000' },
                    { name: 'Emerald Green', price: 2500, color: '#00FF00' }
                ],
                carbonFiber: [
                    { name: 'None', price: 0 },
                    { name: 'Roof', price: 5000 },
                    { name: 'Hood', price: 4000 },
                    { name: 'Full Package', price: 15000 }
                ],
                windowTint: [
                    { name: 'None', price: 0, opacity: 1 },
                    { name: 'Light', price: 1000, opacity: 0.7 },
                    { name: 'Medium', price: 1500, opacity: 0.5 },
                    { name: 'Dark', price: 2000, opacity: 0.3 }
                ]
            },
            wheels: {
                styles: [
                    { name: 'Standard', price: 0, size: 19 },
                    { name: 'Sport', price: 3000, size: 20 },
                    { name: 'Premium', price: 5000, size: 21 },
                    { name: 'Performance', price: 8000, size: 22 }
                ],
                colors: [
                    { name: 'Silver', price: 0 },
                    { name: 'Black', price: 1000 },
                    { name: 'Chrome', price: 2000 },
                    { name: 'Gold', price: 3000 }
                ]
            },
            interior: {
                materials: [
                    { name: 'Leather', price: 0 },
                    { name: 'Nappa Leather', price: 5000 },
                    { name: 'Designo Leather', price: 8000 },
                    { name: 'Exclusive Leather', price: 12000 }
                ],
                colors: [
                    { name: 'Black', price: 0 },
                    { name: 'Beige', price: 1000 },
                    { name: 'Brown', price: 1500 },
                    { name: 'Red', price: 2000 }
                ],
                trim: [
                    { name: 'Wood', price: 0 },
                    { name: 'Carbon Fiber', price: 3000 },
                    { name: 'Aluminum', price: 2000 },
                    { name: 'Piano Black', price: 2500 }
                ]
            },
            performance: {
                exhaust: [
                    { name: 'Standard', price: 0, sound: 'quiet' },
                    { name: 'Sport', price: 3000, sound: 'moderate' },
                    { name: 'Performance', price: 6000, sound: 'loud' },
                    { name: 'Race', price: 10000, sound: 'extreme' }
                ],
                suspension: [
                    { name: 'Comfort', price: 0 },
                    { name: 'Sport', price: 2000 },
                    { name: 'Performance', price: 4000 },
                    { name: 'Track', price: 6000 }
                ]
            },
            features: {
                audio: [
                    { name: 'Standard', price: 0, speakers: 8 },
                    { name: 'Premium', price: 2000, speakers: 12 },
                    { name: 'Burmester', price: 5000, speakers: 15 },
                    { name: 'Burmester 3D', price: 8000, speakers: 31 }
                ],
                technology: [
                    { name: 'Standard', price: 0 },
                    { name: 'Premium', price: 3000 },
                    { name: 'Executive', price: 6000 },
                    { name: 'First Class', price: 10000 }
                ],
                safety: [
                    { name: 'Standard', price: 0 },
                    { name: 'Premium', price: 2000 },
                    { name: 'Executive', price: 4000 },
                    { name: 'First Class', price: 6000 }
                ]
            }
        },
        performance: {
            base: {
                acceleration: 5.0,
                topSpeed: 250,
                handling: 8,
                fuelEfficiency: 7
            },
            modifiers: {
                exhaust: {
                    'Standard': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 },
                    'Sport': { acceleration: 0.2, topSpeed: 5, handling: 0.5, fuelEfficiency: -0.5 },
                    'Performance': { acceleration: 0.5, topSpeed: 10, handling: 1, fuelEfficiency: -1 },
                    'Race': { acceleration: 1, topSpeed: 15, handling: 1.5, fuelEfficiency: -1.5 }
                },
                suspension: {
                    'Comfort': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 },
                    'Sport': { acceleration: 0.1, topSpeed: 0, handling: 1, fuelEfficiency: -0.2 },
                    'Performance': { acceleration: 0.2, topSpeed: 0, handling: 1.5, fuelEfficiency: -0.4 },
                    'Track': { acceleration: 0.3, topSpeed: 0, handling: 2, fuelEfficiency: -0.6 }
                }
            }
        }
    },

    'bmw-7-series': {
        name: 'BMW 7 Series',
        basePrice: 140000,
        description: 'Luxury and performance in perfect harmony',
        category: 'luxury',
        modelPath: '/models/cars/bmw-7-series.glb',
        thumbnail: '/images/cars/bmw-7-series.jpg',
        options: {
            exterior: {
                colors: [
                    { name: 'Carbon Black', price: 0, color: '#000000' },
                    { name: 'Alpine White', price: 2000, color: '#FFFFFF' },
                    { name: 'Mineral White', price: 1500, color: '#F5F5F5' },
                    { name: 'Tanzanite Blue', price: 2500, color: '#1E3F66' },
                    { name: 'Aventurine Red', price: 2500, color: '#8B0000' }
                ],
                carbonFiber: [
                    { name: 'None', price: 0 },
                    { name: 'Roof', price: 5000 },
                    { name: 'Hood', price: 4000 },
                    { name: 'Full Package', price: 15000 }
                ],
                windowTint: [
                    { name: 'None', price: 0, opacity: 1 },
                    { name: 'Light', price: 1000, opacity: 0.7 },
                    { name: 'Medium', price: 1500, opacity: 0.5 },
                    { name: 'Dark', price: 2000, opacity: 0.3 }
                ]
            },
            wheels: {
                styles: [
                    { name: 'Standard', price: 0, size: 19 },
                    { name: 'Sport', price: 3000, size: 20 },
                    { name: 'Premium', price: 5000, size: 21 },
                    { name: 'Performance', price: 8000, size: 22 }
                ],
                colors: [
                    { name: 'Silver', price: 0 },
                    { name: 'Black', price: 1000 },
                    { name: 'Chrome', price: 2000 },
                    { name: 'Gold', price: 3000 }
                ]
            },
            interior: {
                materials: [
                    { name: 'Leather', price: 0 },
                    { name: 'Nappa Leather', price: 5000 },
                    { name: 'Merino Leather', price: 8000 },
                    { name: 'Full Merino Leather', price: 12000 }
                ],
                colors: [
                    { name: 'Black', price: 0 },
                    { name: 'Ivory White', price: 1000 },
                    { name: 'Mocha', price: 1500 },
                    { name: 'Tartufo', price: 2000 }
                ],
                trim: [
                    { name: 'Wood', price: 0 },
                    { name: 'Carbon Fiber', price: 3000 },
                    { name: 'Aluminum', price: 2000 },
                    { name: 'Piano Black', price: 2500 }
                ]
            },
            performance: {
                exhaust: [
                    { name: 'Standard', price: 0, sound: 'quiet' },
                    { name: 'Sport', price: 3000, sound: 'moderate' },
                    { name: 'Performance', price: 6000, sound: 'loud' },
                    { name: 'M Sport', price: 10000, sound: 'extreme' }
                ],
                suspension: [
                    { name: 'Comfort', price: 0 },
                    { name: 'Sport', price: 2000 },
                    { name: 'Performance', price: 4000 },
                    { name: 'M Sport', price: 6000 }
                ]
            },
            features: {
                audio: [
                    { name: 'Standard', price: 0, speakers: 8 },
                    { name: 'Premium', price: 2000, speakers: 12 },
                    { name: 'Harman Kardon', price: 5000, speakers: 16 },
                    { name: 'Bowers & Wilkins', price: 8000, speakers: 20 }
                ],
                technology: [
                    { name: 'Standard', price: 0 },
                    { name: 'Premium', price: 3000 },
                    { name: 'Executive', price: 6000 },
                    { name: 'First Class', price: 10000 }
                ],
                safety: [
                    { name: 'Standard', price: 0 },
                    { name: 'Premium', price: 2000 },
                    { name: 'Executive', price: 4000 },
                    { name: 'First Class', price: 6000 }
                ]
            }
        },
        performance: {
            base: {
                acceleration: 4.8,
                topSpeed: 250,
                handling: 8.5,
                fuelEfficiency: 7.5
            },
            modifiers: {
                exhaust: {
                    'Standard': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 },
                    'Sport': { acceleration: 0.2, topSpeed: 5, handling: 0.5, fuelEfficiency: -0.5 },
                    'Performance': { acceleration: 0.5, topSpeed: 10, handling: 1, fuelEfficiency: -1 },
                    'M Sport': { acceleration: 1, topSpeed: 15, handling: 1.5, fuelEfficiency: -1.5 }
                },
                suspension: {
                    'Comfort': { acceleration: 0, topSpeed: 0, handling: 0, fuelEfficiency: 0 },
                    'Sport': { acceleration: 0.1, topSpeed: 0, handling: 1, fuelEfficiency: -0.2 },
                    'Performance': { acceleration: 0.2, topSpeed: 0, handling: 1.5, fuelEfficiency: -0.4 },
                    'M Sport': { acceleration: 0.3, topSpeed: 0, handling: 2, fuelEfficiency: -0.6 }
                }
            }
        }
    }
};

// Helper function to add a new car model
function addCarModel(modelId, modelData) {
    if (carModels[modelId]) {
        console.warn(`Car model ${modelId} already exists. Overwriting...`);
    }
    carModels[modelId] = modelData;
}

// Helper function to get all car models by category
function getCarsByCategory(category) {
    return Object.entries(carModels)
        .filter(([id, data]) => data.category === category)
        .reduce((acc, [id, data]) => {
            acc[id] = data;
            return acc;
        }, {});
}

// Helper function to get all car models
function getAllCars() {
    return carModels;
}

// Export the car models data and helper functions
export {
    carModels as default,
    addCarModel,
    getCarsByCategory,
    getAllCars
}; 