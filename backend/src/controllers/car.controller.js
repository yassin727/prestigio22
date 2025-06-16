const logger = require('../utils/logger');
const Car = require('../models/Car');
const CarConfiguration = require('../models/Configuration');
const Quote = require('../models/Quote');

// Get regular cars page
exports.getRegularCars = async (req, res) => {
    try {
        res.render('cars/regular', {
            title: 'Regular Vehicles | Prestigio',
            description: 'Explore our collection of regular vehicles from top manufacturers.',
            currentPage: 'regular',
            brandsData: require('../data/brandsData')
        });
    } catch (error) {
        logger.error('Error rendering regular cars page:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the page.'
        });
    }
};

// Get luxury cars page
exports.getLuxuryCars = async (req, res) => {
    try {
        res.render('cars/luxury', {
            title: 'Luxury Vehicles | Prestigio',
            description: 'Explore our exclusive collection of luxury and exotic vehicles.',
            currentPage: 'luxury',
            brandsData: require('../data/luxuryBrandsData')
        });
    } catch (error) {
        logger.error('Error rendering luxury cars page:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the page.'
        });
    }
};

exports.getCarCustomization = async (req, res) => {
    try {
        const car = await Car.findById(req.params.carId);
        if (!car) {
            return res.status(404).render('error', {
                message: 'Car not found'
            });
        }

        // Get available customization options
        const customizationOptions = {
            colors: [
                { name: 'Midnight Black', code: '#000000' },
                { name: 'Arctic White', code: '#FFFFFF' },
                { name: 'Silver Metallic', code: '#C0C0C0' },
                { name: 'Deep Blue', code: '#00008B' },
                { name: 'Crimson Red', code: '#DC143C' }
            ],
            wheels: [
                {
                    id: 'standard',
                    name: 'Standard Alloy',
                    image: '/images/wheels/standard.jpg',
                    price: 0
                },
                {
                    id: 'sport',
                    name: 'Sport Alloy',
                    image: '/images/wheels/sport.jpg',
                    price: 1500
                },
                {
                    id: 'premium',
                    name: 'Premium Alloy',
                    image: '/images/wheels/premium.jpg',
                    price: 2500
                }
            ],
            interiors: [
                {
                    id: 'standard',
                    name: 'Standard Leather',
                    image: '/images/interiors/standard.jpg',
                    price: 0
                },
                {
                    id: 'premium',
                    name: 'Premium Leather',
                    image: '/images/interiors/premium.jpg',
                    price: 3000
                },
                {
                    id: 'luxury',
                    name: 'Luxury Nappa Leather',
                    image: '/images/interiors/luxury.jpg',
                    price: 5000
                }
            ],
            features: [
                {
                    id: 'sunroof',
                    name: 'Panoramic Sunroof',
                    price: 2000
                },
                {
                    id: 'premium-sound',
                    name: 'Premium Sound System',
                    price: 1500
                },
                {
                    id: 'parking-assist',
                    name: 'Parking Assistance Package',
                    price: 1200
                },
                {
                    id: 'safety-plus',
                    name: 'Safety Plus Package',
                    price: 2500
                }
            ]
        };

        res.render('cars/customize', {
            car,
            ...customizationOptions
        });
    } catch (error) {
        console.error('Error in getCarCustomization:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the customization page'
        });
    }
};

exports.saveCarCustomization = async (req, res) => {
    try {
        const { carId, configuration } = req.body;
        const userId = req.user._id; // Assuming you have user authentication

        // Create or update car configuration
        const carConfig = await CarConfiguration.findOneAndUpdate(
            { car: carId, user: userId },
            { configuration },
            { upsert: true, new: true }
        );

        res.json({ success: true, configurationId: carConfig._id });
    } catch (error) {
        console.error('Error in saveCarCustomization:', error);
        res.status(500).json({ success: false, message: 'Failed to save configuration' });
    }
};

exports.getCarConfig = async (req, res) => {
    try {
        const { carId } = req.params;
        const userId = req.user._id; // Assuming you have user authentication

        const config = await CarConfiguration.findOne({ car: carId, user: userId });
        res.json(config || { configuration: {} });
    } catch (error) {
        console.error('Error in getCarConfig:', error);
        res.status(500).json({ message: 'Failed to load configuration' });
    }
};

exports.requestQuote = async (req, res) => {
    try {
        const { carId, configuration } = req.body;
        const userId = req.user._id; // Assuming you have user authentication

        // Calculate total price
        const car = await Car.findById(carId);
        let totalPrice = car.basePrice;

        // Add options prices
        if (configuration.wheels) {
            const wheelOption = car.customizationOptions.wheels.find(w => w.id === configuration.wheels);
            if (wheelOption) totalPrice += wheelOption.price;
        }

        if (configuration.interior) {
            const interiorOption = car.customizationOptions.interiors.find(i => i.id === configuration.interior);
            if (interiorOption) totalPrice += interiorOption.price;
        }

        configuration.features.forEach(featureId => {
            const feature = car.customizationOptions.features.find(f => f.id === featureId);
            if (feature) totalPrice += feature.price;
        });

        // Create quote
        const quote = new Quote({
            user: userId,
            car: carId,
            configuration,
            totalPrice,
            status: 'pending'
        });

        await quote.save();

        res.json({ success: true, quoteId: quote._id });
    } catch (error) {
        console.error('Error in requestQuote:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote' });
    }
}; 