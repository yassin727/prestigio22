const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration
transporter.verify(function(error, success) {
    if (error) {
        logger.error('Email server configuration error:', error);
    } else {
        logger.info('Email server is ready to send messages', { timestamp: new Date().toISOString() });
    }
});

// Load email template
async function loadTemplate(templateName) {
    try {
        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
        const template = await fs.readFile(templatePath, 'utf-8');
        return handlebars.compile(template);
    } catch (error) {
        logger.error('Error loading email template:', error);
        throw new Error('Failed to load email template');
    }
}

// Send welcome email
async function sendWelcomeEmail(email, credentials) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            logger.warn('Email configuration missing. Skipping welcome email.');
            return;
        }

        const template = await loadTemplate('welcome');
        const html = template({
            name: credentials.name,
            username: credentials.username,
            password: credentials.password,
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Prestigio - Your Account Details',
            html
        };

        logger.info('Sending welcome email to:', email);
        const info = await transporter.sendMail(mailOptions);
        logger.info('Welcome email sent:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Error sending welcome email:', error);
        throw error;
    }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            logger.warn('Email configuration missing. Skipping password reset email.');
            return;
        }

        const template = await loadTemplate('password-reset');
        const html = template({
            resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Prestigio',
            html
        };

        logger.info('Sending password reset email to:', email);
        const info = await transporter.sendMail(mailOptions);
        logger.info('Password reset email sent:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        throw error;
    }
}

// Send appointment confirmation email
async function sendAppointmentConfirmationEmail(email, appointmentData) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            logger.warn('Email configuration missing. Skipping appointment confirmation email.');
            return;
        }

        const template = await loadTemplate('appointment-confirmation');
        const html = template({
            customerName: appointmentData.customerName,
            service: appointmentData.service,
            date: new Date(appointmentData.date).toLocaleDateString(),
            time: appointmentData.time,
            orderId: appointmentData.orderId,
            vehicleDetails: appointmentData.vehicleDetails,
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Appointment Confirmation - Prestigio Motors',
            html
        };

        logger.info('Sending appointment confirmation email to:', email);
        const info = await transporter.sendMail(mailOptions);
        logger.info('Appointment confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Error sending appointment confirmation email:', error);
        throw error;
    }
}

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAppointmentConfirmationEmail
}; 