require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');

// Sample luxury cars data
const luxuryCars = [
    {
        name: "488 GTB",
        brand: "Ferrari",
        category: "luxury",
        price: "$275,000",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Twin-turbo V8 engine with 661 HP | 7-speed dual-clutch transmission | 0-60 mph in 3.0 seconds",
        year: 2022,
        specifications: {
            engine: "3.9L Twin-Turbo V8",
            power: "661 HP",
            transmission: "7-Speed Dual-Clutch",
            fuelType: "Premium Gasoline"
        },
        features: ["Carbon Fiber Body", "Adaptive Suspension", "Launch Control", "Premium Sound System"],
        isActive: true,
        featured: true
    },
    {
        name: "911 Turbo S",
        brand: "Porsche",
        category: "luxury",
        price: "$203,500",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Twin-turbo flat-six engine with 640 HP | All-wheel drive | 0-60 mph in 2.6 seconds",
        year: 2023,
        specifications: {
            engine: "3.8L Twin-Turbo Flat-6",
            power: "640 HP",
            transmission: "8-Speed PDK",
            fuelType: "Premium Gasoline"
        },
        features: ["All-Wheel Drive", "Sport Chrono Package", "Ceramic Brakes", "Adaptive Cruise Control"],
        isActive: true,
        featured: true
    },
    {
        name: "Huracán EVO",
        brand: "Lamborghini",
        category: "luxury",
        price: "$261,274",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Naturally aspirated V10 engine with 630 HP | Rear-wheel drive | 0-60 mph in 3.2 seconds",
        year: 2021,
        specifications: {
            engine: "5.2L V10",
            power: "630 HP",
            transmission: "7-Speed Dual-Clutch",
            fuelType: "Premium Gasoline"
        },
        features: ["Carbon Fiber Accents", "Dynamic Steering", "Performance Traction Control", "Alcantara Interior"],
        isActive: true,
        featured: false
    },
    {
        name: "DB11 V8",
        brand: "Aston Martin",
        category: "luxury",
        price: "$198,000",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Twin-turbo V8 engine with 503 HP | Luxury grand tourer | 0-60 mph in 4.0 seconds",
        year: 2022,
        specifications: {
            engine: "4.0L Twin-Turbo V8",
            power: "503 HP",
            transmission: "8-Speed Automatic",
            fuelType: "Premium Gasoline"
        },
        features: ["Leather Interior", "Bang & Olufsen Audio", "Adaptive Dampers", "Carbon Fiber Trim"],
        isActive: true,
        featured: false
    },
    {
        name: "AMG GT 63 S",
        brand: "Mercedes-AMG",
        category: "luxury",
        price: "$159,000",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Twin-turbo V8 engine with 630 HP | 4-door coupe | 0-60 mph in 3.1 seconds",
        year: 2023,
        specifications: {
            engine: "4.0L Twin-Turbo V8",
            power: "630 HP",
            transmission: "9-Speed AMG Speedshift",
            fuelType: "Premium Gasoline"
        },
        features: ["AMG Performance Seats", "Burmester Sound", "AMG Track Pace", "Active Aerodynamics"],
        isActive: true,
        featured: true
    }
];

// Sample regular cars data
const regularCars = [
    {
        name: "Camry XSE",
        brand: "Toyota",
        category: "regular",
        price: "$35,000",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "2.5L 4-cylinder engine with 203 HP | Front-wheel drive | Excellent fuel economy",
        year: 2023,
        specifications: {
            engine: "2.5L 4-Cylinder",
            power: "203 HP",
            transmission: "8-Speed Automatic",
            fuelType: "Regular Gasoline"
        },
        features: ["Toyota Safety Sense 2.0", "Wireless Charging", "JBL Audio", "Panoramic Sunroof"],
        isActive: true,
        featured: false
    },
    {
        name: "Civic Type R",
        brand: "Honda",
        category: "regular",
        price: "$42,000",
        image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Turbocharged 2.0L engine with 315 HP | Manual transmission | Track-focused performance",
        year: 2022,
        specifications: {
            engine: "2.0L Turbo 4-Cylinder",
            power: "315 HP",
            transmission: "6-Speed Manual",
            fuelType: "Premium Gasoline"
        },
        features: ["Brembo Brakes", "Adaptive Dampers", "Sport Seats", "Honda Sensing"],
        isActive: true,
        featured: true
    },
    {
        name: "Model 3 Performance",
        brand: "Tesla",
        category: "regular",
        price: "$55,000",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Dual motor all-wheel drive | 450 HP | 0-60 mph in 3.1 seconds | 315 mile range",
        year: 2023,
        specifications: {
            engine: "Dual Electric Motors",
            power: "450 HP",
            transmission: "Single-Speed",
            fuelType: "Electric"
        },
        features: ["Autopilot", "Premium Audio", "Glass Roof", "Over-the-Air Updates"],
        isActive: true,
        featured: true
    },
    {
        name: "Mustang GT",
        brand: "Ford",
        category: "regular",
        price: "$38,000",
        image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "5.0L V8 engine with 450 HP | Rear-wheel drive | Classic American muscle",
        year: 2022,
        specifications: {
            engine: "5.0L V8",
            power: "450 HP",
            transmission: "10-Speed Automatic",
            fuelType: "Premium Gasoline"
        },
        features: ["Performance Package", "Recaro Seats", "Shaker Audio", "Launch Control"],
        isActive: true,
        featured: false
    },
    {
        name: "WRX STI",
        brand: "Subaru",
        category: "regular",
        price: "$37,000",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        info: "Turbocharged 2.4L boxer engine with 271 HP | All-wheel drive | Rally-inspired performance",
        year: 2023,
        specifications: {
            engine: "2.4L Turbo Boxer",
            power: "271 HP",
            transmission: "6-Speed Manual",
            fuelType: "Premium Gasoline"
        },
        features: ["Symmetrical AWD", "Brembo Brakes", "STI Suspension", "EyeSight Safety"],
        isActive: true,
        featured: false
    }
];

// Sample users data
const sampleUsers = [
    {
        username: "john_doe",
        email: "john.doe@email.com",
        password: "password123",
        fullName: "John Doe",
        phone: "+1-555-0101",
        address: "123 Main St, New York, NY 10001",
        age: 32,
        gender: "male",
        nationality: "American",
        isActive: true
    },
    {
        username: "sarah_wilson",
        email: "sarah.wilson@email.com",
        password: "password123",
        fullName: "Sarah Wilson",
        phone: "+1-555-0102",
        address: "456 Oak Ave, Los Angeles, CA 90210",
        age: 28,
        gender: "female",
        nationality: "American",
        isActive: true
    },
    {
        username: "mike_johnson",
        email: "mike.johnson@email.com",
        password: "password123",
        fullName: "Michael Johnson",
        phone: "+1-555-0103",
        address: "789 Pine St, Chicago, IL 60601",
        age: 35,
        gender: "male",
        nationality: "American",
        isActive: true
    },
    {
        username: "emma_davis",
        email: "emma.davis@email.com",
        password: "password123",
        fullName: "Emma Davis",
        phone: "+1-555-0104",
        address: "321 Elm St, Miami, FL 33101",
        age: 26,
        gender: "female",
        nationality: "American",
        isActive: true
    },
    {
        username: "alex_brown",
        email: "alex.brown@email.com",
        password: "password123",
        fullName: "Alexander Brown",
        phone: "+1-555-0105",
        address: "654 Maple Dr, Seattle, WA 98101",
        age: 41,
        gender: "male",
        nationality: "American",
        isActive: false
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in environment variables');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Car.deleteMany({});
        await User.deleteMany({});

        // Insert luxury cars
        console.log('🏎️ Inserting luxury cars...');
        const insertedLuxuryCars = await Car.insertMany(luxuryCars);
        console.log(`✅ Inserted ${insertedLuxuryCars.length} luxury cars`);

        // Insert regular cars
        console.log('🚗 Inserting regular cars...');
        const insertedRegularCars = await Car.insertMany(regularCars);
        console.log(`✅ Inserted ${insertedRegularCars.length} regular cars`);

        // Insert users
        console.log('👥 Inserting users...');
        const insertedUsers = await User.insertMany(sampleUsers);
        console.log(`✅ Inserted ${insertedUsers.length} users`);

        // Display summary
        console.log('\n📊 Database Seeding Summary:');
        console.log(`• Total Cars: ${insertedLuxuryCars.length + insertedRegularCars.length}`);
        console.log(`• Luxury Cars: ${insertedLuxuryCars.length}`);
        console.log(`• Regular Cars: ${insertedRegularCars.length}`);
        console.log(`• Users: ${insertedUsers.length}`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('You can now access the admin dashboard with real data.');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding function
seedDatabase();