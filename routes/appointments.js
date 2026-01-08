const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/database');

// Create appointment
router.post('/create', async (req, res) => {
    try {
        const { name, phone, brand, model, date, time } = req.body;
        
        // Validate required fields
        if (!name || !phone || !brand || !model || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        
        // Save to database
        const query = `
            INSERT INTO appointments (name, phone, brand, model, appointment_date, appointment_time, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        
        const values = [name, phone, brand, model, date, time, 'pending'];
        const result = await db.query(query, values);
        
        const appointmentId = result.rows[0].id;
        
        // Send to N8N for processing (notifications, etc.)
        try {
            await axios.post(process.env.N8N_APPOINTMENT_WEBHOOK, {
                appointmentId,
                name,
                phone,
                brand,
                model,
                date,
                time,
                timestamp: new Date().toISOString()
            });
        } catch (n8nError) {
            console.error('Error sending to N8N:', n8nError);
            // Continue even if N8N fails
        }
        
        res.json({
            success: true,
            message: 'Cita agendada exitosamente',
            appointmentId
        });
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la cita'
        });
    }
});

// Get appointments (for admin)
router.get('/list', async (req, res) => {
    try {
        const query = `
            SELECT * FROM appointments
            ORDER BY appointment_date DESC, appointment_time DESC
            LIMIT 100
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            appointments: result.rows
        });
        
    } catch (error) {
        console.error('Error listing appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas'
        });
    }
});

// Update appointment status
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const query = `
            UPDATE appointments
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }
        
        res.json({
            success: true,
            appointment: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cita'
        });
    }
});

module.exports = router;
