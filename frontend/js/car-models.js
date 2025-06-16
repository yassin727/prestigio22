// Comprehensive Car Models Data
const carModels = {
    // Bugatti Models
    'bugatti-bolide': {
        name: 'Bugatti Bolide 2024',
        basePrice: 4200000,
        description: 'Track-focused hypercar with extreme aerodynamics',
        category: 'hypercar',
        modelPath: '/models/bugatti/bugatti_bolide_2024__www.vecarz.com.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Midnight Black', price: 0, color: '#000000' },
                    { name: 'Pearl White', price: 15000, color: '#FFFFFF' },
                    { name: 'Racing Blue', price: 20000, color: '#0066cc' },
                    { name: 'Carbon Grey', price: 25000, color: '#2c2c2c' },
                    { name: 'Gold Chrome', price: 50000, color: '#ffd700' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 15000 },
                    { name: 'High Gloss', price: 10000 },
                    { name: 'Satin', price: 12000 },
                    { name: 'Chrome', price: 35000 }
                ]
            },
            wheels: [
                { name: 'Standard Carbon', price: 0 },
                { name: 'Forged Magnesium', price: 25000 },
                { name: 'Titanium Racing', price: 45000 }
            ],
            interior: [
                { name: 'Carbon Racing', price: 0 },
                { name: 'Alcantara Premium', price: 15000 },
                { name: 'Leather Luxury', price: 25000 }
            ],
            performance: [
                { name: 'Track Setup', price: 0 },
                { name: 'Street Legal', price: 50000 },
                { name: 'Ultimate Track', price: 100000 }
            ]
        }
    },

    // Mercedes Models
    'mercedes-s-class': {
        name: 'Mercedes-Benz S-Class Maybach',
        basePrice: 185000,
        description: 'Ultimate luxury sedan with Maybach refinement',
        category: 'luxury',
        modelPath: '/models/mercedes/2021_mercedes-benz_s-class_maybach.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Obsidian Black', price: 0, color: '#000000' },
                    { name: 'Diamond White', price: 3000, color: '#FFFFFF' },
                    { name: 'Selenite Grey', price: 2500, color: '#c0c0c0' },
                    { name: 'Ruby Red', price: 4000, color: '#dc143c' },
                    { name: 'Emerald Green', price: 4000, color: '#228b22' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 8000 },
                    { name: 'High Gloss', price: 5000 },
                    { name: 'Satin', price: 6000 },
                    { name: 'Chrome', price: 15000 }
                ]
            },
            wheels: [
                { name: 'Standard Alloy', price: 0 },
                { name: 'Sport Performance', price: 3500 },
                { name: 'Maybach Forged', price: 8500 },
                { name: 'Chrome Luxury', price: 12000 }
            ],
            interior: [
                { name: 'Black Leather', price: 0 },
                { name: 'Beige Nappa', price: 5000 },
                { name: 'Designo Leather', price: 12000 },
                { name: 'Exclusive Maybach', price: 25000 }
            ],
            performance: [
                { name: 'Comfort', price: 0 },
                { name: 'Sport Plus', price: 8000 },
                { name: 'AMG Performance', price: 18000 }
            ]
        }
    },

    'mercedes-c-class': {
        name: 'Mercedes-Benz C220 W206',
        basePrice: 65000,
        description: 'Compact luxury sedan with modern technology',
        category: 'luxury',
        modelPath: '/models/mercedes/mercedes-_benz_w206_c220.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Polar White', price: 0, color: '#FFFFFF' },
                    { name: 'Obsidian Black', price: 1500, color: '#000000' },
                    { name: 'Brilliant Blue', price: 2000, color: '#0066cc' },
                    { name: 'Mojave Silver', price: 1800, color: '#c0c0c0' },
                    { name: 'Jupiter Red', price: 2200, color: '#dc143c' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 4000 },
                    { name: 'High Gloss', price: 2500 },
                    { name: 'Satin', price: 3000 }
                ]
            },
            wheels: [
                { name: 'Standard 18"', price: 0 },
                { name: 'AMG 19"', price: 2500 },
                { name: 'Performance 20"', price: 4500 }
            ],
            interior: [
                { name: 'Artico Black', price: 0 },
                { name: 'Leather Beige', price: 2500 },
                { name: 'AMG Nappa', price: 5500 }
            ],
            performance: [
                { name: 'Standard', price: 0 },
                { name: 'AMG Line', price: 6000 },
                { name: 'AMG Performance', price: 12000 }
            ]
        }
    },

    // BMW Models
    'bmw-x6m': {
        name: 'BMW X6M Competition',
        basePrice: 125000,
        description: 'High-performance luxury SUV coupe',
        category: 'performance-suv',
        modelPath: '/models/bmw/bmw_x6m_competition_assetto__www.vecarz.com.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Carbon Black', price: 0, color: '#000000' },
                    { name: 'Alpine White', price: 2500, color: '#FFFFFF' },
                    { name: 'Storm Bay', price: 3000, color: '#0066cc' },
                    { name: 'Mineral Grey', price: 2800, color: '#c0c0c0' },
                    { name: 'Fire Red', price: 3200, color: '#dc143c' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 6000 },
                    { name: 'High Gloss', price: 4000 },
                    { name: 'Satin', price: 4500 }
                ]
            },
            wheels: [
                { name: 'Standard M 21"', price: 0 },
                { name: 'Forged M 22"', price: 5500 },
                { name: 'Carbon M 22"', price: 12000 }
            ],
            interior: [
                { name: 'M Leather Black', price: 0 },
                { name: 'Merino Cognac', price: 4500 },
                { name: 'Full Merino', price: 8500 }
            ],
            performance: [
                { name: 'Competition', price: 0 },
                { name: 'Track Package', price: 15000 },
                { name: 'Ultimate M', price: 25000 }
            ]
        }
    },

    'bmw-m8': {
        name: 'BMW M8 Competition Convertible',
        basePrice: 145000,
        description: 'Ultimate luxury grand tourer convertible',
        category: 'grand-tourer',
        modelPath: '/models/bmw/bmw_m8_competition_convertible_f93.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Mineral Grey', price: 0, color: '#c0c0c0' },
                    { name: 'Alpine White', price: 2500, color: '#FFFFFF' },
                    { name: 'Carbon Black', price: 2800, color: '#000000' },
                    { name: 'Barcelona Blue', price: 3500, color: '#0066cc' },
                    { name: 'Imola Red', price: 4000, color: '#dc143c' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 7000 },
                    { name: 'High Gloss', price: 5000 },
                    { name: 'Satin', price: 5500 }
                ]
            },
            wheels: [
                { name: 'M Forged 20"', price: 0 },
                { name: 'Carbon M 20"', price: 8500 },
                { name: 'Titanium M 21"', price: 15000 }
            ],
            interior: [
                { name: 'M Leather Black', price: 0 },
                { name: 'Silverstone/Black', price: 3500 },
                { name: 'Tartufo Full Merino', price: 12000 }
            ],
            performance: [
                { name: 'Competition', price: 0 },
                { name: 'Track Package', price: 18000 },
                { name: 'Carbon Package', price: 35000 }
            ]
        }
    },

    // Porsche Models
    'porsche-911': {
        name: 'Porsche 911 Carrera 4S Cabriolet',
        basePrice: 135000,
        description: 'Iconic sports car convertible with all-wheel drive',
        category: 'sports-car',
        modelPath: 'models/porsche/2019_porsche_911_carrera_4s_cabriolet_992.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Guards Red', price: 0, color: '#dc143c' },
                    { name: 'Carrara White', price: 2500, color: '#FFFFFF' },
                    { name: 'Jet Black', price: 2200, color: '#000000' },
                    { name: 'Racing Yellow', price: 3500, color: '#ffd700' },
                    { name: 'Miami Blue', price: 4000, color: '#0066cc' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 5500 },
                    { name: 'High Gloss', price: 3500 },
                    { name: 'Satin', price: 4000 }
                ]
            },
            wheels: [
                { name: 'Carrera S 20/21"', price: 0 },
                { name: 'Sport Design 20/21"', price: 3500 },
                { name: 'RS Spyder 20/21"', price: 6500 }
            ],
            interior: [
                { name: 'Standard Leather', price: 0 },
                { name: 'Club Leather', price: 4500 },
                { name: 'Full Leather', price: 8500 }
            ],
            performance: [
                { name: 'Standard 4S', price: 0 },
                { name: 'Sport Chrono', price: 5500 },
                { name: 'Sport Plus', price: 12000 }
            ]
        }
    },

    'porsche-cayenne': {
        name: 'Porsche Cayenne Turbo Coupe',
        basePrice: 165000,
        description: 'High-performance luxury SUV coupe',
        category: 'luxury-suv',
        modelPath: 'models/porsche/2020_porsche_cayenne_turbo_coupe.glb',
        hasModel: true,
        options: {
            exterior: {
                colors: [
                    { name: 'Carrara White', price: 0, color: '#FFFFFF' },
                    { name: 'Jet Black', price: 2200, color: '#000000' },
                    { name: 'Mahogany', price: 3500, color: '#8b4513' },
                    { name: 'Mamba Green', price: 4000, color: '#228b22' },
                    { name: 'Carmine Red', price: 3800, color: '#dc143c' }
                ],
                finishes: [
                    { name: 'Metallic', price: 0 },
                    { name: 'Matte', price: 6500 },
                    { name: 'High Gloss', price: 4500 },
                    { name: 'Satin', price: 5000 }
                ]
            },
            wheels: [
                { name: 'Cayenne Turbo 21"', price: 0 },
                { name: 'Sport Design 22"', price: 4500 },
                { name: 'RS Spyder 22"', price: 8500 }
            ],
            interior: [
                { name: 'Standard Leather', price: 0 },
                { name: 'Club Leather', price: 5500 },
                { name: 'Full Leather Plus', price: 12000 }
            ],
            performance: [
                { name: 'Turbo', price: 0 },
                { name: 'Sport Chrono', price: 6500 },
                { name: 'Turbo S Package', price: 25000 }
            ]
        }
    }
};

// Placeholder mappings for cars without 3D models
const placeholderMappings = {
    // Ferrari (using Porsche 911 as sports car placeholder)
    'ferrari-488': { placeholder: 'porsche-911', name: 'Ferrari 488 GTB', basePrice: 280000 },
    'ferrari-f8': { placeholder: 'porsche-911', name: 'Ferrari F8 Tributo', basePrice: 320000 },
    'ferrari-sf90': { placeholder: 'porsche-911', name: 'Ferrari SF90 Stradale', basePrice: 625000 },

    // Lamborghini (using Porsche 911 as sports car placeholder)
    'lamborghini-huracan': { placeholder: 'porsche-911', name: 'Lamborghini Huracán', basePrice: 248000 },
    'lamborghini-aventador': { placeholder: 'porsche-911', name: 'Lamborghini Aventador', basePrice: 421000 },
    'lamborghini-urus': { placeholder: 'porsche-cayenne', name: 'Lamborghini Urus', basePrice: 218000 },

    // McLaren (using Porsche 911 as sports car placeholder)
    'mclaren-720s': { placeholder: 'porsche-911', name: 'McLaren 720S', basePrice: 299000 },
    'mclaren-artura': { placeholder: 'porsche-911', name: 'McLaren Artura', basePrice: 233000 },

    // Rolls Royce (using Mercedes S-Class as luxury placeholder)
    'rolls-royce-phantom': { placeholder: 'mercedes-s-class', name: 'Rolls-Royce Phantom', basePrice: 460000 },
    'rolls-royce-cullinan': { placeholder: 'porsche-cayenne', name: 'Rolls-Royce Cullinan', basePrice: 348000 },

    // Bentley (using Mercedes S-Class as luxury placeholder)
    'bentley-continental': { placeholder: 'bmw-m8', name: 'Bentley Continental GT', basePrice: 231000 },
    'bentley-flying-spur': { placeholder: 'mercedes-s-class', name: 'Bentley Flying Spur', basePrice: 214000 },

    // Aston Martin (using BMW M8 as grand tourer placeholder)
    'aston-martin-db11': { placeholder: 'bmw-m8', name: 'Aston Martin DB11', basePrice: 205000 },
    'aston-martin-vantage': { placeholder: 'porsche-911', name: 'Aston Martin Vantage', basePrice: 139000 }
};

// Helper functions
function getCarModel(carId) {
    if (carModels[carId]) {
        return { ...carModels[carId], isPlaceholder: false };
    } else if (placeholderMappings[carId]) {
        const placeholder = placeholderMappings[carId];
        const baseModel = carModels[placeholder.placeholder];
        return {
            ...baseModel,
            name: placeholder.name,
            basePrice: placeholder.basePrice,
            isPlaceholder: true,
            placeholderFor: carId,
            actualModel: placeholder.placeholder
        };
    }
    return null;
}

function getAllCarIds() {
    return [...Object.keys(carModels), ...Object.keys(placeholderMappings)];
}

function getCarsByCategory(category) {
    return Object.entries(carModels)
        .filter(([id, data]) => data.category === category)
        .reduce((acc, [id, data]) => {
            acc[id] = data;
            return acc;
        }, {});
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { carModels, placeholderMappings, getCarModel, getAllCarIds, getCarsByCategory };
} else {
    window.CarModels = { carModels, placeholderMappings, getCarModel, getAllCarIds, getCarsByCategory };
} 