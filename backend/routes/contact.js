const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many contact requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation middleware
const validateContactRequest = (req, res, next) => {
    const { service, problem } = req.body;

    // Check required fields
    if (!service || !problem) {
        return res.status(400).json({
            success: false,
            message: 'Service and problem description are required.'
        });
    }

    // Validate service type
    const validServices = [
        'luxury-cars', 'regular-cars', 'car-customization',
        'financing', 'maintenance', 'insurance', 'trade-in', 'general'
    ];
    
    if (!validServices.includes(service)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid service type selected.'
        });
    }

    // Validate problem length
    if (problem.trim().length < 10 || problem.trim().length > 2000) {
        return res.status(400).json({
            success: false,
            message: 'Problem description must be between 10 and 2000 characters.'
        });
    }

    next();
};

// Helper function to determine priority based on service and keywords
const determinePriority = (service, problem) => {
    const problemLower = problem.toLowerCase();
    
    // Urgent keywords
    const urgentKeywords = ['urgent', 'emergency', 'broken', 'accident', 'crash', 'stolen', 'fire'];
    if (urgentKeywords.some(keyword => problemLower.includes(keyword))) {
        return 'urgent';
    }
    
    // High priority services and keywords
    const highKeywords = ['payment', 'finance', 'insurance', 'delivery', 'warranty'];
    if (service === 'luxury-cars' || highKeywords.some(keyword => problemLower.includes(keyword))) {
        return 'high';
    }
    
    // Low priority for general inquiries
    if (service === 'general') {
        return 'low';
    }
    
    return 'medium';
};

// POST /api/contact-requests - Submit new contact request
router.post('/contact-requests', contactLimiter, validateContactRequest, async (req, res) => {
    try {
        const { service, problem } = req.body;
        
        // Determine priority automatically
        const priority = determinePriority(service, problem);
        
        // Create new contact request
        const contactRequest = new Contact({
            service,
            problem: problem.trim(),
            priority,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID || `session_${Date.now()}`
        });

        const savedRequest = await contactRequest.save();

        res.status(201).json({
            success: true,
            message: 'Contact request submitted successfully!',
            data: {
                id: savedRequest._id,
                service: savedRequest.service,
                status: savedRequest.status,
                priority: savedRequest.priority,
                createdAt: savedRequest.createdAt
            }
        });

    } catch (error) {
        console.error('Error submitting contact request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/contact-requests - Get all contact requests (admin only)
router.get('/contact-requests', async (req, res) => {
    try {
        const { status, service, priority, page = 1, limit = 20 } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (service) filter.service = service;
        if (priority) filter.priority = priority;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get requests with pagination
        const requests = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contact.countDocuments(filter);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    total,
                    hasNext: skip + requests.length < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching contact requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact requests.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/contact-requests/pending - Get pending requests
router.get('/contact-requests/pending', async (req, res) => {
    try {
        const pendingRequests = await Contact.getPendingRequests();
        
        res.json({
            success: true,
            data: pendingRequests,
            count: pendingRequests.length
        });

    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending requests.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/contact-requests/:id/status - Update request status
router.put('/contact-requests/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, response, assignedTo } = req.body;

        const request = await Contact.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Contact request not found.'
            });
        }

        // Update fields
        request.status = status;
        if (response) request.response = response;
        if (assignedTo) request.assignedTo = assignedTo;
        if (status === 'resolved') request.responseDate = new Date();

        const updatedRequest = await request.save();

        res.json({
            success: true,
            message: 'Request status updated successfully.',
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating request status.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/contact-requests/stats - Get contact request statistics
router.get('/contact-requests/stats', async (req, res) => {
    try {
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const serviceStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                serviceStats,
                priorityStats,
                totalRequests: await Contact.countDocuments()
            }
        });

    } catch (error) {
        console.error('Error fetching contact stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact statistics.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 