const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/database');

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Validate
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        
        // Save to database
        const query = `
            INSERT INTO contact_messages (name, email, phone, message)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        
        const values = [name, email, phone, message];
        const result = await db.query(query, values);
        
        const messageId = result.rows[0].id;
        
        // Send to N8N for email notification
        try {
            await axios.post(process.env.N8N_WEBHOOK_URL, {
                type: 'contact_form',
                messageId,
                name,
                email,
                phone,
                message,
                timestamp: new Date().toISOString()
            });
        } catch (n8nError) {
            console.error('Error sending to N8N:', n8nError);
        }
        
        res.json({
            success: true,
            message: 'Mensaje enviado exitosamente'
        });
        
    } catch (error) {
        console.error('Error submitting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje'
        });
    }
});

module.exports = router;
