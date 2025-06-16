const carModels = {
    ferrari: {
        f8: {
            name: 'Ferrari F8 Tributo',
            basePrice: 276550,
            modelPath: '/models/ferrari/f8.glb',
            customizationOptions: {
                colors: [
                    { name: 'Rosso Corsa', code: '#FF0000' },
                    { name: 'Nero Daytona', code: '#000000' },
                    { name: 'Bianco Avus', code: '#FFFFFF' },
                    { name: 'Giallo Modena', code: '#FFD700' },
                    { name: 'Blu Pozzi', code: '#0000FF' }
                ],
                wheels: [
                    {
                        id: 'standard',
                        name: 'Standard Alloy',
                        image: '/images/wheels/ferrari-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'sport',
                        name: 'Sport Alloy',
                        image: '/images/wheels/ferrari-sport.jpg',
                        price: 15000
                    },
                    {
                        id: 'carbon',
                        name: 'Carbon Fiber',
                        image: '/images/wheels/ferrari-carbon.jpg',
                        price: 25000
                    }
                ],
                interiors: [
                    {
                        id: 'standard',
                        name: 'Standard Leather',
                        image: '/images/interiors/ferrari-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'premium',
                        name: 'Premium Leather',
                        image: '/images/interiors/ferrari-premium.jpg',
                        price: 15000
                    },
                    {
                        id: 'carbon',
                        name: 'Carbon Fiber & Leather',
                        image: '/images/interiors/ferrari-carbon.jpg',
                        price: 25000
                    }
                ],
                features: [
                    {
                        id: 'carbon-roof',
                        name: 'Carbon Fiber Roof',
                        price: 20000
                    },
                    {
                        id: 'racing-seats',
                        name: 'Racing Seats',
                        price: 15000
                    },
                    {
                        id: 'premium-sound',
                        name: 'Premium Sound System',
                        price: 8000
                    },
                    {
                        id: 'track-package',
                        name: 'Track Package',
                        price: 30000
                    }
                ]
            }
        }
    },
    lamborghini: {
        huracan: {
            name: 'Lamborghini Huracán',
            basePrice: 261274,
            modelPath: '/models/lamborghini/huracan.glb',
            customizationOptions: {
                colors: [
                    { name: 'Verde Mantis', code: '#50C878' },
                    { name: 'Arancio Atlas', code: '#FF7F00' },
                    { name: 'Nero Noctis', code: '#000000' },
                    { name: 'Bianco Monocerus', code: '#FFFFFF' },
                    { name: 'Blu Cepheus', code: '#0000FF' }
                ],
                wheels: [
                    {
                        id: 'standard',
                        name: 'Standard Alloy',
                        image: '/images/wheels/lamborghini-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'forged',
                        name: 'Forged Alloy',
                        image: '/images/wheels/lamborghini-forged.jpg',
                        price: 18000
                    },
                    {
                        id: 'carbon',
                        name: 'Carbon Fiber',
                        image: '/images/wheels/lamborghini-carbon.jpg',
                        price: 28000
                    }
                ],
                interiors: [
                    {
                        id: 'standard',
                        name: 'Standard Leather',
                        image: '/images/interiors/lamborghini-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'premium',
                        name: 'Premium Leather',
                        image: '/images/interiors/lamborghini-premium.jpg',
                        price: 18000
                    },
                    {
                        id: 'alcantara',
                        name: 'Alcantara & Leather',
                        image: '/images/interiors/lamborghini-alcantara.jpg',
                        price: 28000
                    }
                ],
                features: [
                    {
                        id: 'carbon-package',
                        name: 'Carbon Fiber Package',
                        price: 25000
                    },
                    {
                        id: 'sport-seats',
                        name: 'Sport Seats',
                        price: 12000
                    },
                    {
                        id: 'premium-sound',
                        name: 'Premium Sound System',
                        price: 9000
                    },
                    {
                        id: 'track-package',
                        name: 'Track Package',
                        price: 35000
                    }
                ]
            }
        }
    },
    porsche: {
        '911': {
            name: 'Porsche 911',
            basePrice: 106100,
            modelPath: '/models/porsche/911.glb',
            customizationOptions: {
                colors: [
                    { name: 'Guards Red', code: '#FF0000' },
                    { name: 'Jet Black', code: '#000000' },
                    { name: 'Carrara White', code: '#FFFFFF' },
                    { name: 'Miami Blue', code: '#00BFFF' },
                    { name: 'Racing Yellow', code: '#FFD700' }
                ],
                wheels: [
                    {
                        id: 'standard',
                        name: 'Standard Alloy',
                        image: '/images/wheels/porsche-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'sport',
                        name: 'Sport Alloy',
                        image: '/images/wheels/porsche-sport.jpg',
                        price: 12000
                    },
                    {
                        id: 'turbo',
                        name: 'Turbo Design',
                        image: '/images/wheels/porsche-turbo.jpg',
                        price: 20000
                    }
                ],
                interiors: [
                    {
                        id: 'standard',
                        name: 'Standard Leather',
                        image: '/images/interiors/porsche-standard.jpg',
                        price: 0
                    },
                    {
                        id: 'premium',
                        name: 'Premium Leather',
                        image: '/images/interiors/porsche-premium.jpg',
                        price: 12000
                    },
                    {
                        id: 'carbon',
                        name: 'Carbon Fiber & Leather',
                        image: '/images/interiors/porsche-carbon.jpg',
                        price: 20000
                    }
                ],
                features: [
                    {
                        id: 'sport-chrono',
                        name: 'Sport Chrono Package',
                        price: 15000
                    },
                    {
                        id: 'premium-sound',
                        name: 'Premium Sound System',
                        price: 7000
                    },
                    {
                        id: 'sport-seats',
                        name: 'Sport Seats',
                        price: 8000
                    },
                    {
                        id: 'track-package',
                        name: 'Track Package',
                        price: 25000
                    }
                ]
            }
        }
    }
};

// Export the car models
if (typeof module !== 'undefined' && module.exports) {
    module.exports = carModels;
} else {
 