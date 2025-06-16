// Dashboard Statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/dashboard/stats');
        const stats = await response.json();
        
        document.querySelector('.card:nth-child(1) .card-value').textContent = stats.totalVehicles;
        document.querySelector('.card:nth-child(2) .card-value').textContent = stats.totalCustomers;
        document.querySelector('.card:nth-child(3) .card-value').textContent = stats.pendingOrders;
        document.querySelector('.card:nth-child(4) .card-value').textContent = `$${(stats.totalRevenue / 1000000).toFixed(1)}M`;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Car Management
async function loadCars() {
    try {
        const response = await fetch('/api/admin/cars');
        const cars = await response.json();
        
        const tbody = document.querySelector('#cars table tbody');
        tbody.innerHTML = '';
        
        cars.forEach(car => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${car._id.slice(-6)}</td>
                <td><img src="${car.images[0]}" alt="${car.make} ${car.model}" style="width:60px;height:40px;object-fit:cover;"></td>
                <td>${car.make} ${car.model}</td>
                <td>${car.type}</td>
                <td>${car.year}</td>
                <td>$${car.price.toLocaleString()}</td>
                <td><span class="status ${car.status.toLowerCase()}">${car.status}</span></td>
                <td>
                    <button class="action-btn btn-success" onclick="editCar('${car._id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteCar('${car._id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Add Car Form
document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        make: document.getElementById('carMake').value,
        model: document.getElementById('carModel').value,
        year: parseInt(document.getElementById('carYear').value),
        price: parseFloat(document.getElementById('carPrice').value),
        type: document.getElementById('carType').value,
        status: document.getElementById('carStatus').value,
        description: document.getElementById('carDescription').value,
        images: [] // Handle image upload separately
    };

    try {
        const response = await fetch('/api/admin/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Car added successfully');
            document.getElementById('carForm').reset();
            document.getElementById('add-car').style.display = 'none';
            loadCars();
        } else {
            const error = await response.json();
            alert(error.message);
        }
    } catch (error) {
        console.error('Error adding car:', error);
        alert('An error occurred while adding the car');
    }
});

// Delete Car
async function deleteCar(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        try {
            const response = await fetch(`/api/admin/cars/${carId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Car deleted successfully');
                loadCars();
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error deleting car:', error);
            alert('An error occurred while deleting the car');
        }
    }
}

// Customer Management
async function loadCustomers() {
    try {
        const response = await fetch('/api/admin/customers');
        const customers = await response.json();
        
        const tbody = document.querySelector('#customers table tbody');
        tbody.innerHTML = '';
        
        customers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${customer._id.slice(-6)}</td>
                <td>${customer.fullName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.vehiclesOwned || 0}</td>
                <td>${customer.lastPurchase || '-'}</td>
                <td>
                    <button class="action-btn btn-success" onclick="viewCustomer('${customer._id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteCustomer('${customer._id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Delete Customer
async function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            const response = await fetch(`/api/admin/customers/${customerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Customer deleted successfully');
                loadCustomers();
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('An error occurred while deleting the customer');
        }
    }
}

// View Customer Details
async function viewCustomer(customerId) {
    try {
        const response = await fetch(`/api/admin/customers/${customerId}`);
        const customer = await response.json();
        
        // Create and show modal with customer details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>Customer Details</h2>
                <div class="customer-details">
                    <p><strong>Name:</strong> ${customer.fullName}</p>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Vehicles Owned:</strong> ${customer.vehiclesOwned || 0}</p>
                    <p><strong>Last Purchase:</strong> ${customer.lastPurchase || '-'}</p>
                    <h3>Order History</h3>
                    <div class="order-history">
                        ${customer.orders ? customer.orders.map(order => `
                            <div class="order-item">
                                <p>Order #${order._id.slice(-6)}</p>
                                <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p>Status: ${order.status}</p>
                                <p>Total: $${order.totalAmount}</p>
                            </div>
                        `).join('') : 'No orders found'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.modal-close').onclick = () => {
            modal.remove();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('An error occurred while loading customer details');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadCars();
    loadCustomers();
    
    // Add Car button functionality
    document.getElementById('addCarBtn').onclick = () => {
        document.getElementById('add-car').style.display = 'block';
    };
    
    document.getElementById('cancelCarBtn').onclick = () => {
        document.getElementById('add-car').style.display = 'none';
    };
}); 