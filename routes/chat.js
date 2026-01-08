const express = require('express');
const router = express.Router();
const axios = require('axios');

// Send message to N8N
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido'
            });
        }
        
        // Send to N8N webhook
        const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, {
            message: message,
            timestamp: new Date().toISOString(),
            source: 'web-chat'
        });
        
        // Process N8N response
        const botResponse = n8nResponse.data;
        
        // Check for special actions
        let responseData = {
            success: true,
            response: botResponse.message || 'Entiendo. ¿Hay algo más en lo que pueda ayudarte?',
            transferToWhatsApp: false,
            showAppointmentForm: false
        };
        
        // Detect if user wants to talk to human
        if (message.toLowerCase().includes('humano') || 
            message.toLowerCase().includes('persona') ||
            message.toLowerCase().includes('asesor')) {
            responseData.transferToWhatsApp = true;
            responseData.response = 'Te estoy transfiriendo a WhatsApp para que un asesor te atienda personalmente. 📱';
        }
        
        // Detect if user wants to schedule appointment
        if (message.toLowerCase().includes('agendar') || 
            message.toLowerCase().includes('cita') ||
            message.toLowerCase().includes('reservar')) {
            responseData.showAppointmentForm = true;
            responseData.response = 'Perfecto, vamos a agendar tu cita. Por favor completa los siguientes datos:';
        }
        
        res.json(responseData);
        
    } catch (error) {
        console.error('Error en chat:', error);
        
        // Fallback response if N8N is down
        res.json({
            success: true,
            response: 'Disculpa, estoy teniendo problemas técnicos. ¿Te gustaría hablar con un asesor por WhatsApp?',
            transferToWhatsApp: false,
            showAppointmentForm: false
        });
    }
});

module.exports = router;
