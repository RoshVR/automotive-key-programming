# 🔗 Guía de Integración N8N y Chatwoot

## 📋 Tabla de Contenidos

1. [Instalación de N8N](#instalación-de-n8n)
2. [Instalación de Chatwoot](#instalación-de-chatwoot)
3. [Workflows de N8N](#workflows-de-n8n)
4. [Integración WhatsApp](#integración-whatsapp)
5. [Automatizaciones](#automatizaciones)

---

## 🤖 Instalación de N8N

### Opción 1: Docker (Recomendado)

```bash
# Crear directorio
mkdir -p /opt/n8n
cd /opt/n8n

# Crear docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
      - N8N_HOST=n8n.tudominio.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.tudominio.com
      - GENERIC_TIMEZONE=America/Mexico_City
    volumes:
      - n8n_data:/home/node/.n8n
    restart: always

volumes:
  n8n_data:
EOF

# Iniciar N8N
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Opción 2: NPM

```bash
# Instalar globalmente
npm install -g n8n

# Iniciar N8N
n8n start

# Con PM2
pm2 start n8n --name n8n
pm2 save
```

### Acceder a N8N

```
URL: https://n8n.tudominio.com
Usuario: admin
Password: tu_password_seguro
```

---

## 💬 Instalación de Chatwoot

### Con Docker

```bash
# Crear directorio
mkdir -p /opt/chatwoot
cd /opt/chatwoot

# Descargar docker-compose
wget -O docker-compose.yml https://raw.githubusercontent.com/chatwoot/chatwoot/develop/docker-compose.production.yaml

# Crear archivo .env
cat > .env << EOF
# Chatwoot Configuration
RAILS_ENV=production
SECRET_KEY_BASE=$(openssl rand -hex 64)

# Database
POSTGRES_HOST=postgres
POSTGRES_DATABASE=chatwoot_production
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=tu_password_db

# Redis
REDIS_URL=redis://redis:6379

# Application Host
FRONTEND_URL=https://chat.tudominio.com
FORCE_SSL=true

# Email Configuration (Opcional)
MAILER_SENDER_EMAIL=noreply@tudominio.com
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password

# WhatsApp (Cloud API)
WHATSAPP_CLOUD_BASE_URL=https://graph.facebook.com/v13.0
EOF

# Iniciar Chatwoot
docker-compose up -d

# Crear usuario administrador
docker-compose exec chatwoot bundle exec rails db:chatwoot_prepare
```

### Configuración Inicial Chatwoot

1. Acceder a `https://chat.tudominio.com`
2. Crear cuenta de administrador
3. Configurar empresa
4. Crear inbox de Website
5. Configurar inbox de WhatsApp

---

## 🔄 Workflows de N8N

### Workflow 1: Chat AI con Detección de Intención

```json
{
  "name": "Chat AI - Automotive Keys",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chat",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "const message = $input.item.json.message.toLowerCase();\nconst timestamp = $input.item.json.timestamp;\n\nlet response = '';\nlet action = 'none';\nlet transferToWhatsApp = false;\nlet showAppointmentForm = false;\n\n// Detectar saludos\nif (message.match(/hola|buenos días|buenas tardes|buenas noches|hey/)) {\n  response = '¡Hola! 👋 Bienvenido a nuestro servicio de programación de llaves automotrices. ¿En qué puedo ayudarte?';\n}\n// Detectar preguntas de precios\nelse if (message.match(/precio|costo|cuanto|tarifa/)) {\n  response = '💰 Los precios varían según la marca y modelo de tu vehículo:\\n\\n' +\n    '🔹 Toyota/Honda: $150-$250\\n' +\n    '🔹 Ford/Chevrolet: $180-$280\\n' +\n    '🔹 BMW/Mercedes: $350-$600\\n\\n' +\n    '¿Qué marca y modelo es tu vehículo?';\n}\n// Detectar preguntas de marcas\nelse if (message.match(/marca|qué|cuál|cuales/)) {\n  response = '🚗 Trabajamos con TODAS las marcas:\\n\\n' +\n    '✅ Toyota, Honda, Nissan\\n' +\n    '✅ Ford, Chevrolet, GMC\\n' +\n    '✅ BMW, Mercedes, Audi\\n' +\n    '✅ Volkswagen, Mazda, Hyundai\\n' +\n    '✅ Kia, Jeep, Dodge\\n' +\n    '✅ Y muchas más...\\n\\n' +\n    '¿Qué marca es tu vehículo?';\n}\n// Detectar horarios\nelse if (message.match(/horario|hora|abierto|atienden/)) {\n  response = '🕐 Nuestros horarios son:\\n\\n' +\n    '📅 Lunes a Viernes: 8:00 AM - 6:00 PM\\n' +\n    '📅 Sábados: 9:00 AM - 2:00 PM\\n' +\n    '📅 Domingos: Cerrado\\n\\n' +\n    '🚨 Servicio de emergencia 24/7 disponible';\n}\n// Detectar ubicación\nelse if (message.match(/ubicación|dirección|donde|están/)) {\n  response = '📍 Estamos ubicados en:\\n\\n' +\n    'Calle Ejemplo #123\\n' +\n    'Colonia Centro\\n' +\n    'Ciudad, Estado\\n\\n' +\n    '🚗 Contamos con estacionamiento';\n}\n// Detectar emergencia\nelse if (message.match(/emergencia|urgente|ayuda|perdí/)) {\n  response = '🚨 ¡Entiendo que es urgente! \\n\\n' +\n    'Para servicio de emergencia:\\n' +\n    '📞 Llámanos: +1 (234) 567-890\\n\\n' +\n    '¿O prefieres que te contacte un técnico por WhatsApp?';\n  transferToWhatsApp = true;\n}\n// Detectar agendamiento\nelse if (message.match(/agendar|cita|reservar|appointment/)) {\n  response = '📅 Perfecto, vamos a agendar tu cita. Por favor completa los siguientes datos:';\n  showAppointmentForm = true;\n}\n// Detectar contacto humano\nelse if (message.match(/humano|persona|asesor|operador/)) {\n  response = '👤 Te estoy transfiriendo con un asesor por WhatsApp...';\n  transferToWhatsApp = true;\n}\n// Detectar servicios\nelse if (message.match(/servicio|ofrecen|hacen/)) {\n  response = '🔧 Nuestros servicios incluyen:\\n\\n' +\n    '✅ Programación de llaves con chip\\n' +\n    '✅ Duplicado de llaves\\n' +\n    '✅ Llaves con control remoto\\n' +\n    '✅ Apertura de vehículos\\n' +\n    '✅ Reprogramación de sistemas\\n' +\n    '✅ Servicio a domicilio\\n\\n' +\n    '¿Qué servicio necesitas?';\n}\n// Respuesta por defecto\nelse {\n  response = 'Entiendo. ¿Necesitas:\\n\\n' +\n    '1️⃣ Ver precios\\n' +\n    '2️⃣ Agendar una cita\\n' +\n    '3️⃣ Hablar con un asesor\\n\\n' +\n    'Escribe el número de tu opción.';\n}\n\nreturn {\n  message: response,\n  transferToWhatsApp: transferToWhatsApp,\n  showAppointmentForm: showAppointmentForm,\n  originalMessage: $input.item.json.message,\n  timestamp: timestamp\n};"
      },
      "name": "Process Message",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"response\": $json.message, \"transferToWhatsApp\": $json.transferToWhatsApp, \"showAppointmentForm\": $json.showAppointmentForm } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.transferToWhatsApp }}",
              "value2": true
            }
          ]
        }
      },
      "name": "Check Transfer",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 500]
    },
    {
      "parameters": {
        "operation": "sendText",
        "chatId": "={{ $env.WHATSAPP_NUMBER }}",
        "text": "🔔 Nueva transferencia de chat web:\\n\\nMensaje: {{ $json.originalMessage }}\\nHora: {{ $json.timestamp }}"
      },
      "name": "Notify WhatsApp",
      "type": "n8n-nodes-base.whatsApp",
      "typeVersion": 1,
      "position": [650, 500]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Process Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Message": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          },
          {
            "node": "Check Transfer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Transfer": {
      "main": [
        [
          {
            "node": "Notify WhatsApp",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Workflow 2: Procesamiento de Citas

Crear nuevo workflow en N8N:

1. **Webhook** - Recibir datos de cita
   - Path: `appointment`
   - Method: POST

2. **Function** - Formatear datos
   ```javascript
   const { name, phone, brand, model, date, time } = $input.item.json;
   
   return {
     name,
     phone,
     brand,
     model,
     date,
     time,
     formattedMessage: `📅 Nueva Cita Agendada\n\n` +
       `👤 Cliente: ${name}\n` +
       `📞 Teléfono: ${phone}\n` +
       `🚗 Vehículo: ${brand} ${model}\n` +
       `📆 Fecha: ${date}\n` +
       `🕐 Hora: ${time}`
   };
   ```

3. **WhatsApp** - Enviar confirmación al cliente
   - To: `{{ $json.phone }}`
   - Message: Confirmación personalizada

4. **WhatsApp** - Notificar al equipo
   - To: Número del negocio
   - Message: `{{ $json.formattedMessage }}`

5. **Email** (Opcional) - Enviar email de confirmación

6. **Chatwoot** - Crear conversación
   - API Call a Chatwoot para crear conversación

---

## 📱 Integración WhatsApp

### Opción 1: WhatsApp Cloud API (Meta)

```bash
# En N8N, configurar credenciales de WhatsApp Cloud API

1. Ir a developers.facebook.com
2. Crear app de WhatsApp Business
3. Obtener:
   - Phone Number ID
   - Access Token
   - Webhook Verify Token

4. En N8N:
   - Credentials → Add Credential
   - Tipo: WhatsApp Cloud API
   - Ingresar datos
```

### Opción 2: Twilio

```bash
# Más simple para empezar

1. Crear cuenta en Twilio
2. Configurar WhatsApp Sandbox
3. En N8N:
   - Credentials → Twilio
   - Account SID y Auth Token
```

### Opción 3: Chatwoot + 360Dialog

```bash
# Recomendado para producción

1. Crear cuenta en 360Dialog
2. Verificar número de WhatsApp Business
3. En Chatwoot:
   - Settings → Inboxes → WhatsApp
   - Conectar con 360Dialog
4. Webhook de Chatwoot a N8N para automatizaciones
```

---

## 🔗 Conectar Chatwoot con N8N

### Webhook de Chatwoot a N8N

1. En N8N, crear webhook:
   ```
   URL: https://n8n.tudominio.com/webhook/chatwoot
   Method: POST
   ```

2. En Chatwoot:
   ```
   Settings → Integrations → Webhooks
   URL: https://n8n.tudominio.com/webhook/chatwoot
   Events: message_created, conversation_created
   ```

3. Workflow en N8N para procesar:
   ```javascript
   // Detectar eventos de Chatwoot
   const event = $input.item.json.event;
   
   if (event === 'message_created') {
     const message = $input.item.json.message_content;
     const sender = $input.item.json.sender_type;
     
     if (sender === 'contact') {
       // Procesar mensaje del cliente
       // Enviar a AI, guardar en DB, etc.
     }
   }
   ```

---

## 🤖 Automatizaciones Adicionales

### 1. Recordatorio de Citas (24h antes)

```javascript
// N8N Schedule Trigger - Cada hora

// 1. Query a PostgreSQL
SELECT * FROM appointments 
WHERE appointment_date = CURRENT_DATE + INTERVAL '1 day'
AND appointment_time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '1 hour'
AND reminder_sent = false

// 2. Function - Formatear
const appointments = $input.all();

return appointments.map(apt => ({
  phone: apt.json.phone,
  name: apt.json.name,
  message: `Hola ${apt.json.name}, te recordamos tu cita mañana a las ${apt.json.appointment_time} para tu ${apt.json.brand} ${apt.json.model}. ¡Te esperamos!`
}));

// 3. WhatsApp - Enviar mensaje
// 4. PostgreSQL - Update reminder_sent = true
```

### 2. Seguimiento Post-Servicio

```javascript
// 3 días después del servicio

// 1. Schedule Trigger - Diario
// 2. Query appointments completados hace 3 días
// 3. Enviar mensaje de seguimiento por WhatsApp:

"Hola [nombre], ¿cómo ha funcionado tu llave nueva? 
Nos encantaría saber tu experiencia. 
Responde con una calificación del 1 al 5."

// 4. Guardar respuesta en base de datos
```

### 3. Lead Nurturing

```javascript
// Para contactos que no agendaron

// 1. Query contactos sin cita
// 2. Esperar 2 días
// 3. Enviar mensaje de seguimiento
// 4. Si no responde en 7 días, enviar oferta especial
```

---

## 📊 Dashboard de Métricas (Opcional)

### Workflow de Analytics

```javascript
// Ejecutar diariamente

// 1. Contar mensajes del día
SELECT COUNT(*) FROM chat_logs WHERE DATE(created_at) = CURRENT_DATE

// 2. Contar citas agendadas
SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE

// 3. Tasa de conversión
// 4. Enviar reporte por email
```

---

## 🔐 Seguridad

### Proteger Webhooks N8N

```javascript
// En N8N Function antes de procesar

const receivedSignature = $input.item.headers['x-signature'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify($input.item.json))
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

### Variables de Entorno en N8N

```bash
# En docker-compose.yml o variables de entorno

- WEBHOOK_SECRET=tu_secret_key
- CHATWOOT_API_TOKEN=tu_token
- WHATSAPP_API_KEY=tu_api_key
```

---

## 🧪 Testing

### Probar Webhook de Chat

```bash
curl -X POST https://n8n.tudominio.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, quiero información sobre precios"}'
```

### Probar Creación de Cita

```bash
curl -X POST http://localhost:3000/api/appointments/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "phone": "+1234567890",
    "brand": "Toyota",
    "model": "Corolla 2020",
    "date": "2026-01-15",
    "time": "10:00"
  }'
```

---

## 📚 Recursos Adicionales

- [Documentación N8N](https://docs.n8n.io)
- [Documentación Chatwoot](https://www.chatwoot.com/docs)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)

---

## 🆘 Troubleshooting

### N8N no recibe webhooks
```bash
# Verificar que N8N esté corriendo
docker ps | grep n8n

# Ver logs
docker logs n8n

# Verificar firewall
sudo ufw status
```

### Chatwoot no envía mensajes
```bash
# Verificar Redis
redis-cli ping

# Ver logs de Chatwoot
docker-compose logs chatwoot

# Verificar configuración de inbox
```

### WhatsApp no funciona
```bash
# Verificar credenciales en N8N
# Verificar que el número esté verificado
# Revisar límites de mensajes de WhatsApp Business
```
