const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Create new order
const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        // Create new order
        const order = new Order({
            car: {
                carId: orderData.car.id,
                name: orderData.car.name,
                brand: orderData.car.brand,
                basePrice: orderData.car.price,
                image: orderData.car.image
            },
            customizations: orderData.customizations || [],
            basePrice: orderData.basePrice,
            customer: {
                name: orderData.customer.name,
                email: orderData.customer.email,
                phone: orderData.customer.phone,
                address: orderData.customer.address
            },
            payment: {
                method: orderData.payment.method,
                status: 'pending',
                deliveryLocation: orderData.payment.deliveryLocation,
                deliveryDate: orderData.payment.deliveryDate,
                deliveryTime: orderData.payment.deliveryTime,
                cardLast4: orderData.payment.cardLast4
            },
            notes: orderData.notes
        });

        // Save order to database
        await order.save();

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(order);
            order.emailSent = true;
            await order.save();
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with order processing even if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId: order.orderId,
            order: {
                orderId: order.orderId,
                car: order.car,
                totalPrice: order.totalPrice,
                status: order.status,
                estimatedDelivery: order.payment.deliveryDate
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place order. Please try again.',
            error: error.message
        });
    }
};

// Get order by ID
const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findOne({ orderId }).populate('car.carId');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('car.carId');

        const totalOrders = await Order.countDocuments();

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                hasNext: page < Math.ceil(totalOrders / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;

        const order = await Order.findOne({ orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        // Send status update email
        try {
            await sendStatusUpdateEmail(order);
        } catch (emailError) {
            console.error('Status update email failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
    const customizationsList = order.customizations.map(custom => 
        `<li>${custom.name} - $${custom.price.toLocaleString()}</li>`
    ).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #d4af37; margin: 0;">Order Confirmation</h1>
                <p style="margin: 10px 0 0 0;">Thank you for your purchase!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Order Details</h2>
                
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Order Date:</strong> ${order.orderDate.toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Vehicle Information</h3>
                    <p><strong>${order.car.brand} ${order.car.name}</strong></p>
                    <p>Base Price: ${order.car.basePrice}</p>
                </div>

                ${order.customizations.length > 0 ? `
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Customizations</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${customizationsList}
                    </ul>
                </div>
                ` : ''}

                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Customer Information</h3>
                    <p><strong>Name:</strong> ${order.customer.name}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                </div>

                <div style="background: #d4af37; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0;">Total Price</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 0;">$${order.totalPrice.toLocaleString()}</p>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <p style="color: #666;">We will contact you soon with delivery details.</p>
                    <p style="color: #666;">If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderId}`,
        html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${order.customer.email}`);
};

// Send status update email
const sendStatusUpdateEmail = async (order) => {
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #d4af37; margin: 0;">Order Update</h1>
                <p style="margin: 10px 0 0 0;">Your order status has been updated</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Vehicle:</strong> ${order.car.brand} ${order.car.name}</p>
                    <p><strong>New Status:</strong> <span style="color: #d4af37; font-weight: bold;">${order.status}</span></p>
                    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <p style="color: #666;">Thank you for choosing us!</p>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: order.customer.email,
        subject: `Order Update - ${order.orderId}`,
        html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${order.customer.email}`);
};

module.exports = {
    createOrder,
    getOrder,
    getAllOrders,
    updateOrderStatus
}; 