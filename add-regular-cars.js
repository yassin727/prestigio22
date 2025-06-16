const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:5000/api';

// Function to add a single car to database
async function addCar(vehicleData) {
    try {
        const response = await fetch(`${API_BASE}/admin/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicleData)
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
}

// Regular cars data - extracted from your static data
const regularCars = [
    // Toyota
    { brand: "Toyota", name: "Camry", info: "Midsize sedan, 2.5L I4 (203 HP) or 3.5L V6 (301 HP)", price: "$26K-35K" },
    { brand: "Toyota", name: "Corolla", info: "Compact sedan or hatchback, 2.0L I4 (169 HP)", price: "$21K-28K" },
    { brand: "Toyota", name: "RAV4", info: "Compact SUV, 2.5L I4 (203 HP) or hybrid (219 HP)", price: "$28K-38K" },
    { brand: "Toyota", name: "Highlander", info: "Midsize SUV, 2.4L I4 (265 HP) or hybrid (243 HP)", price: "$36K-52K" },
    { brand: "Toyota", name: "Prius", info: "Hybrid compact car, 1.8L I4 (121 HP) or plug-in hybrid (220 HP)", price: "$25K-34K" },
    
    // Honda
    { brand: "Honda", name: "Civic", info: "Compact sedan or hatchback, 2.0L I4 (158 HP) or 1.5L turbo (180 HP)", price: "$23K-30K" },
    { brand: "Honda", name: "Accord", info: "Midsize sedan, 1.5L turbo (192 HP) or 2.0L turbo (252 HP)", price: "$27K-38K" },
    { brand: "Honda", name: "CR-V", info: "Compact SUV, 1.5L turbo (190 HP) or hybrid (212 HP)", price: "$28K-38K" },
    { brand: "Honda", name: "HR-V", info: "Subcompact SUV, 2.0L I4 (158 HP)", price: "$23K-30K" },
    { brand: "Honda", name: "Odyssey", info: "Minivan, 3.5L V6 (280 HP)", price: "$37K-52K" },
    
    // Ford
    { brand: "Ford", name: "Mustang", info: "Sports car, 2.3L turbo I4 (310 HP) or 5.0L V8 (450 HP)", price: "$30K-60K" },
    { brand: "Ford", name: "Explorer", info: "Midsize SUV, 2.3L turbo I4 (300 HP) or 3.0L V6 (400 HP)", price: "$36K-55K" },
    { brand: "Ford", name: "F-150", info: "Full-size pickup, 3.3L V6 (290 HP) to 3.5L turbo V6 (450 HP)", price: "$33K-80K" },
    { brand: "Ford", name: "Escape", info: "Compact SUV, 1.5L turbo I4 (181 HP) or 2.0L turbo (250 HP)", price: "$26K-38K" },
    
    // Chevrolet
    { brand: "Chevrolet", name: "Malibu", info: "Midsize sedan, 1.5L turbo I4 (160 HP)", price: "$25K-35K" },
    { brand: "Chevrolet", name: "Traverse", info: "Midsize SUV, 3.6L V6 (310 HP)", price: "$35K-50K" },
    { brand: "Chevrolet", name: "Silverado 1500", info: "Full-size pickup, 2.7L turbo I4 (310 HP) to 6.2L V8 (420 HP)", price: "$36K-70K" },
    { brand: "Chevrolet", name: "Equinox", info: "Compact SUV, 1.5L turbo I4 (175 HP)", price: "$26K-35K" },
    { brand: "Chevrolet", name: "Trailblazer", info: "Subcompact SUV, 1.2L turbo I3 (137 HP) or 1.3L turbo (155 HP)", price: "$22K-30K" },
    
    // Hyundai
    { brand: "Hyundai", name: "Elantra", info: "Compact sedan, 2.0L I4 (147 HP) or 1.6L turbo (201 HP)", price: "$20K-28K" },
    { brand: "Hyundai", name: "Sonata", info: "Midsize sedan, 2.5L I4 (191 HP) or 1.6L turbo (180 HP)", price: "$25K-35K" },
    { brand: "Hyundai", name: "Tucson", info: "Compact SUV, 2.5L I4 (187 HP) or hybrid (226 HP)", price: "$26K-38K" },
    { brand: "Hyundai", name: "Santa Fe", info: "Midsize SUV, 2.5L I4 (191 HP) or hybrid (225 HP)", price: "$28K-42K" },
    { brand: "Hyundai", name: "Palisade", info: "Large SUV, 3.8L V6 (291 HP)", price: "$35K-50K" },
    
    // Nissan
    { brand: "Nissan", name: "Altima", info: "Midsize sedan, 2.5L I4 (188 HP) or 2.0L turbo (248 HP)", price: "$25K-35K" },
    { brand: "Nissan", name: "Sentra", info: "Compact sedan, 2.0L I4 (149 HP)", price: "$20K-25K" },
    { brand: "Nissan", name: "Rogue", info: "Compact SUV, 1.5L turbo I3 (201 HP)", price: "$27K-38K" },
    { brand: "Nissan", name: "Pathfinder", info: "Midsize SUV, 3.5L V6 (284 HP)", price: "$34K-50K" },
    { brand: "Nissan", name: "Maxima", info: "Midsize sedan, 3.5L V6 (300 HP)", price: "$38K-45K" },
    
    // More brands...
    { brand: "Tesla", name: "Model 3", info: "Electric sedan, 283–450 HP, 272–358-mile range", price: "$40K-55K" },
    { brand: "Tesla", name: "Model Y", info: "Electric SUV, 283–456 HP, 279–330-mile range", price: "$45K-60K" },
    { brand: "Mazda", name: "Mazda3", info: "Compact sedan or hatchback, 2.5L I4 (186 HP)", price: "$22K-30K" },
    { brand: "Mazda", name: "CX-5", info: "Compact SUV, 2.5L I4 (187 HP) or turbo (250 HP)", price: "$26K-38K" },
    { brand: "Subaru", name: "Outback", info: "Midsize wagon, 2.5L flat-4 (182 HP) or 2.4L turbo (260 HP)", price: "$28K-40K" },
    { brand: "Subaru", name: "Forester", info: "Compact SUV, 2.5L flat-4 (182 HP)", price: "$26K-35K" }
];

async function addAllRegularCars() {
    console.log('🚗 Starting to add regular cars to database...\n');
    
    let totalAdded = 0;
    let errors = 0;
    
    for (const car of regularCars) {
        try {
            const vehicleData = {
                name: car.name,
                brand: car.brand,
                category: 'regular', // This is crucial - sets category as regular
                price: car.price,
                image: "/api/placeholder/600/400", // Default placeholder image
                brandLogo: "/api/placeholder/150/150",
                info: car.info,
                isActive: true, // Ensure it shows up in listings
                year: 2024,
                status: 'available',
                location: 'Showroom'
            };
            
            const result = await addCar(vehicleData);
            
            if (result.success) {
                console.log(`✅ Added: ${car.brand} ${car.name}`);
                totalAdded++;
            } else {
                console.log(`❌ Failed: ${car.brand} ${car.name} - ${result.message}`);
                errors++;
            }
            
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.log(`❌ Error adding ${car.brand} ${car.name}:`, error.message);
            errors++;
        }
    }
    
    console.log(`\n🎉 Bulk import completed!`);
    console.log(`✅ Successfully added: ${totalAdded} vehicles`);
    console.log(`❌ Errors: ${errors}`);
    
    if (totalAdded > 0) {
        console.log('\n📝 Next steps:');
        console.log('1. Check your regular cars page - new vehicles should appear automatically');
        console.log('2. The inventory will refresh every 60 seconds');
        console.log('3. Or click the refresh button for immediate update');
    }
}

// Run the import
addAllRegularCars().catch(console.error); 