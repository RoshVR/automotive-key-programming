require('dotenv').config();
const { pool } = require('../config/database');

const createTables = async () => {
    try {
        console.log('Creando tablas...');
        
        // Appointments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla appointments creada');
        
        // Contact messages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla contact_messages creada');
        
        // Chat logs table (optional, for analytics)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255),
                message TEXT NOT NULL,
                sender VARCHAR(50) NOT NULL,
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla chat_logs creada');
        
        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_date 
            ON appointments(appointment_date, appointment_time)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_status 
            ON appointments(status)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_contact_status 
            ON contact_messages(status)
        `);
        
        console.log('✅ Índices creados');
        console.log('✅ Migración completada exitosamente');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
};

createTables();
