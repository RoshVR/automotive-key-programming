# 🚀 Landing Page - Programación de Llaves Automotrices

Sistema completo de landing page con chat AI integrado para negocio de programación de llaves automotrices.

## 📋 Características

- ✅ Landing page responsive con Bootstrap 5
- ✅ Chat AI integrado con N8N
- ✅ Sistema de agendamiento de citas
- ✅ Formulario de contacto
- ✅ Integración con WhatsApp
- ✅ Base de datos PostgreSQL
- ✅ Backend Node.js con Express
- ✅ Rate limiting y seguridad
- ✅ Integración con Chatwoot

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, Bootstrap 5, jQuery
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL
- **Automatización**: N8N
- **Chat**: Chatwoot
- **Mensajería**: WhatsApp

## 📦 Instalación

### 1. Prerequisitos

```bash
# Node.js (versión 18 o superior)
node --version

# PostgreSQL (versión 14 o superior)
psql --version

# Git
git --version
```

### 2. Clonar e instalar dependencias

```bash
# Navegar al directorio
cd d:\ADC

# Instalar dependencias
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
```

Configurar las siguientes variables en `.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=automotive_keys
DB_USER=postgres
DB_PASSWORD=tu_password

# N8N Webhooks
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/chat
N8N_APPOINTMENT_WEBHOOK=https://tu-n8n.com/webhook/appointment

# Chatwoot
CHATWOOT_API_URL=https://tu-chatwoot.com/api/v1
CHATWOOT_API_TOKEN=tu_token
CHATWOOT_INBOX_ID=tu_inbox_id

# WhatsApp
WHATSAPP_NUMBER=+1234567890
```

### 4. Crear base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE automotive_keys;

# Salir
\q
```

### 5. Ejecutar migraciones

```bash
npm run migrate
```

### 6. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Configuración de N8N

### Workflow para Chat AI

Crear un workflow en N8N con los siguientes nodos:

1. **Webhook** - Recibir mensajes del chat
   - Method: POST
   - Path: `/webhook/chat`

2. **Function** - Procesar mensaje
   ```javascript
   // Detectar intención
   const message = $input.item.json.message.toLowerCase();
   
   let response = '';
   let action = 'none';
   
   if (message.includes('precio') || message.includes('costo')) {
       response = '💰 Nuestros precios varían según la marca y modelo. ¿Qué vehículo tienes?';
   } else if (message.includes('marcas')) {
       response = '🚗 Trabajamos con todas las marcas: Toyota, Honda, Ford, Chevrolet, Nissan, BMW, Mercedes y más.';
   } else if (message.includes('horario')) {
       response = '🕐 Horario: Lun-Vie 8:00-18:00, Sábados 9:00-14:00';
   } else if (message.includes('ubicación') || message.includes('dirección')) {
       response = '📍 Estamos en Calle Ejemplo #123, Ciudad';
   } else {
       response = 'Entiendo. ¿Necesitas agendar una cita o prefieres hablar con un asesor?';
   }
   
   return {
       message: response,
       action: action
   };
   ```

3. **Respond to Webhook** - Enviar respuesta

### Workflow para Citas

1. **Webhook** - Recibir datos de cita
   - Method: POST
   - Path: `/webhook/appointment`

2. **PostgreSQL** - Guardar en base de datos (opcional, ya se guarda desde backend)

3. **WhatsApp** - Enviar confirmación
   - Usar nodo de WhatsApp Business API o Twilio
   - Mensaje: "Hola {{name}}, tu cita está confirmada para el {{date}} a las {{time}}..."

4. **Email** - Enviar notificación al equipo
   - Para: equipo@empresa.com
   - Asunto: "Nueva cita agendada"

5. **Chatwoot** - Crear conversación
   - Endpoint: `/api/v1/accounts/{account_id}/conversations`
   - Método: POST

## 💬 Configuración de Chatwoot

### 1. Instalar Chatwoot

```bash
# Docker (recomendado)
docker-compose up -d
```

### 2. Configurar Inbox

1. Ir a Settings → Inboxes → Add Inbox
2. Seleccionar "Website"
3. Copiar el widget code
4. Configurar WhatsApp inbox:
   - Seleccionar "WhatsApp"
   - Conectar con número de WhatsApp Business

### 3. Integrar con N8N

En N8N, crear nodo HTTP Request:

```
Método: POST
URL: {{$env.CHATWOOT_API_URL}}/conversations
Headers:
  api_access_token: {{$env.CHATWOOT_API_TOKEN}}
Body:
{
  "contact_id": "{{contact_id}}",
  "inbox_id": "{{$env.CHATWOOT_INBOX_ID}}",
  "status": "open"
}
```

## 📱 Configuración de WhatsApp

### Opción 1: WhatsApp Business API (Oficial)

1. Crear cuenta en Meta for Developers
2. Configurar WhatsApp Business API
3. Obtener Phone Number ID y Access Token
4. Configurar webhook en N8N

### Opción 2: Twilio (Más simple)

1. Crear cuenta en Twilio
2. Configurar WhatsApp Sandbox
3. Usar nodo de Twilio en N8N

### Opción 3: Chatwoot + WhatsApp

1. Configurar inbox de WhatsApp en Chatwoot
2. Conectar con 360Dialog o Twilio
3. Las conversaciones se manejan automáticamente

## 🗄️ Estructura de Base de Datos

### Tabla: appointments
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- phone (VARCHAR)
- brand (VARCHAR)
- model (VARCHAR)
- appointment_date (DATE)
- appointment_time (TIME)
- status (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabla: contact_messages
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- message (TEXT)
- status (VARCHAR)
- created_at (TIMESTAMP)
```

### Tabla: chat_logs
```sql
- id (SERIAL PRIMARY KEY)
- session_id (VARCHAR)
- message (TEXT)
- sender (VARCHAR)
- response (TEXT)
- created_at (TIMESTAMP)
```

## 🔒 Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting (100 req/15min)
- ✅ Validación de inputs
- ✅ Variables de entorno
- ✅ HTTPS recomendado en producción

## 🚀 Despliegue

### Preparar para producción

1. Configurar `NODE_ENV=production` en `.env`
2. Asegurar que PostgreSQL esté optimizado
3. Configurar SSL/HTTPS
4. Configurar dominio y DNS
5. Configurar backup automático de base de datos

### Opciones de despliegue

- **VPS**: DigitalOcean, Linode, AWS EC2
- **PaaS**: Heroku, Railway, Render
- **Contenedores**: Docker + Kubernetes

## 📊 Monitoreo

Recomendaciones:

- **Logs**: PM2 o Winston
- **Uptime**: UptimeRobot
- **Errores**: Sentry
- **Analytics**: Google Analytics
- **Performance**: New Relic o DataDog

## 🆘 Soporte

Para soporte técnico:
- Email: soporte@ejemplo.com
- WhatsApp: +1234567890

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles
