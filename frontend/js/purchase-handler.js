// Purchase Handler for Car Customizer
document.addEventListener('DOMContentLoaded', function() {
    // Add purchase button event listener when DOM is ready
    const purchaseBtn = document.getElementById('purchaseBtn');
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', handlePurchase);
    }
});

function handlePurchase() {
    const selectedCarId = getSelectedCar();
    const selectedCar = availableModels[selectedCarId];
    
    if (!selectedCar) {
        showNotification('Error: Car data not found', 'error');
        return;
    }
    
    // Save current configuration first
    if (typeof saveConfiguration === 'function') {
        saveConfiguration();
    }
    
    // Calculate total price
    let totalPrice = currentConfig.basePrice || selectedCar.price;
    
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
    
    // Prepare purchase data
    const purchaseData = {
        carId: selectedCarId,
        carName: selectedCar.name,
        basePrice: currentConfig.basePrice || selectedCar.price,
        totalPrice: totalPrice,
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
    if (typeof showNotification === 'function') {
        showNotification('Redirecting to customer service for appointment booking...', 'info');
    } else {
        alert('Redirecting to customer service for appointment booking...');
    }
    
    // Redirect to customer service page
    setTimeout(() => {
        window.location.href = '/pages/customerservice.html?purchase=true';
    }, 2000);
}

// Utility function to get selected car (fallback if not available)
function getSelectedCar() {
    if (typeof window.getSelectedCar === 'function') {
        return window.getSelectedCar();
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car');
    return carId || 'bugatti-bolide';
} 