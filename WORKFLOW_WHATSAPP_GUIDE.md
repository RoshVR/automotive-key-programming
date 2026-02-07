# 📱 Guía: Workflow Completo con WhatsApp para Automotive Keys

## 🎯 Características del Nuevo Workflow

### ✅ Lo que incluye:

1. **Captura automática de datos del cliente:**
   - Nombre
   - Teléfono (WhatsApp)
   - Email
   - Almacenamiento en custom attributes de Chatwoot

2. **Personalización de respuestas:**
   - Usa el nombre del cliente
   - Contexto de conversaciones anteriores (últimos 5 mensajes)
   - Respuestas adaptadas a la información disponible

3. **Integración con WhatsApp:**
   - Genera enlaces de WhatsApp automáticamente
   - Detecta cuando el cliente solicita contacto por WhatsApp
   - Facilita la transición del chat web a WhatsApp

4. **AI Mejorada:**
   - Prompt completo con toda la información del negocio
   - Manejo de diferentes escenarios (precios, citas, emergencias)
   - Respuestas profesionales y personalizadas

---

## 📋 Flujo del Workflow

```
1. Webhook de Chatwoot recibe mensaje
   ↓
2. Filtra solo mensajes entrantes
   ↓
3. Procesa y extrae datos del mensaje
   ↓
4. Verifica si ya tiene datos de contacto
   ↓
5a. Si NO tiene datos → Solicita nombre, teléfono o email
5b. Si SÍ tiene datos → Pasa al AI Agent
   ↓
6. AI Agent genera respuesta personalizada
   ↓
7. Verifica si cliente quiere contacto por WhatsApp
   ↓
8a. Si quiere WhatsApp → Genera enlace wa.me
8b. Si NO → Envía respuesta normal
   ↓
9. Envía respuesta a Chatwoot
   ↓
10. Actualiza datos del contacto en Chatwoot
```

---

## 🚀 Instalación y Configuración

### Paso 1: Importar el Workflow en N8N

1. Ve a N8N: http://localhost:5678
2. Elimina el workflow anterior de Chatwoot (si existe)
3. Click en **+** → **Import from File**
4. Selecciona: `n8n-workflows/automotive-keys-full-workflow.json`
5. Click **Import**

### Paso 2: Configurar Credenciales

En el nodo **"Send Response to Chatwoot"** y **"Update Contact Info"**:

1. Click en **Credentials for HTTP Header Auth**
2. Selecciona tu credencial existente o crea nueva:
   - **Name:** Chatwoot API
   - **Header Name:** `api_access_token`
   - **Header Value:** `ggrAKhhxTdAMJMn42BwPdWnd`
3. Click **Save**

### Paso 3: Activar el Workflow

1. Click en el botón **Active** (arriba a la derecha)
2. Verifica que aparezca la URL del webhook
3. Esta debería ser: `https://1938fab1e9b5.ngrok-free.app/webhook/chatwoot-webhook`

---

## 🧪 Probar el Workflow

### Test 1: Cliente Nuevo (Sin datos)

**Usuario escribe en el chat:**
```
Hola, necesito información sobre programación de llaves
```

**Respuesta esperada:**
```
¡Hola! 👋 Gracias por contactarnos. Para brindarte un mejor servicio, 
¿podrías compartirme tu nombre completo y número de WhatsApp o correo 
electrónico? Así podré enviarte información personalizada sobre nuestros 
servicios de programación de llaves.
```

### Test 2: Cliente Proporciona Datos

**Usuario escribe:**
```
Claro, soy Juan Pérez y mi WhatsApp es 5551234567
```

**El sistema:**
1. Extrae: Nombre="Juan Pérez", Teléfono="5551234567"
2. Guarda en Chatwoot custom attributes
3. Envía respuesta personalizada del AI

### Test 3: Consulta con Datos ya Guardados

**Usuario escribe:**
```
¿Cuánto cuesta programar una llave de Honda Civic 2020?
```

**Respuesta esperada:**
```
¡Hola Juan! 👋 

Para un Honda Civic 2020, el costo de programación de llave está 
aproximadamente entre $200-300 USD, dependiendo del tipo de llave 
(con o sin control remoto).

Nuestro servicio incluye:
✅ Programación completa
✅ Servicio a domicilio disponible
✅ Garantía de 1 año
✅ Tiempo: 30-45 minutos

¿Te gustaría agendar una cita? Necesitaría tu dirección y horario 
preferido.
```

### Test 4: Solicitud de WhatsApp

**Usuario escribe:**
```
¿Puedo contactarte por WhatsApp?
```

**Respuesta esperada:**
```
[Respuesta del AI]

📱 Para continuar la conversación por WhatsApp, haz click aquí:
https://wa.me/5551234567

También puedes escanear este código QR desde tu teléfono.
```

---

## 🔧 Personalización del Workflow

### Modificar el Prompt del AI

Edita el nodo **"AI Agent (Ollama)"**:

```javascript
// Encuentra esta sección y modifica según tu negocio:

📋 INFORMACIÓN DEL SERVICIO:
• Programamos llaves para TODAS las marcas
• Servicio a domicilio disponible
• Tiempo promedio: 30-45 minutos
• Garantía de 1 año
• Precios desde $150 USD
```

### Cambiar Horarios

```javascript
⏰ HORARIOS:
• Lunes a Viernes: 8:00 AM - 8:00 PM
• Sábados: 9:00 AM - 6:00 PM
• Domingos: 10:00 AM - 4:00 PM
```

### Agregar más servicios

```javascript
💼 SERVICIOS DISPONIBLES:
1. Programación de llaves nuevas
2. Duplicado de llaves existentes
3. Reemplazo de llaves perdidas
// Agrega más aquí
```

---

## 📊 Datos que se Guardan en Chatwoot

El workflow guarda automáticamente en Chatwoot:

```json
{
  "custom_attributes": {
    "phone_number": "5551234567",
    "email": "juan@ejemplo.com",
    "last_interaction": "2026-01-20T15:30:00Z"
  }
}
```

Puedes ver estos datos en:
1. Chatwoot → Conversations
2. Click en la conversación
3. Panel derecho → "Contact Details"

---

## 🔄 Próximos Pasos: Integrar WhatsApp Directo

Para conectar WhatsApp Business API (no solo enlaces):

### Opción 1: WhatsApp Business API Oficial

**Requisitos:**
- Cuenta de Facebook Business
- Número de WhatsApp Business verificado
- Meta Business Suite configurado

**Pasos:**
1. En Chatwoot: Settings → Inboxes → Add Inbox
2. Selecciona "WhatsApp"
3. Conecta tu cuenta de Meta
4. Sigue el wizard de configuración

### Opción 2: Usar servicio de terceros

**Servicios compatibles:**
- **360Dialog**: https://www.360dialog.com/
- **Twilio**: https://www.twilio.com/whatsapp
- **MessageBird**: https://messagebird.com/

**Configuración con 360Dialog:**

1. **Obtener API Key de 360Dialog:**
   - Regístrate en 360Dialog
   - Verifica tu número de WhatsApp
   - Obtén tu API Key

2. **Configurar en Chatwoot:**
```bash
# Agregar al .env
WHATSAPP_360DIALOG_API_KEY=tu_api_key_aqui
```

3. **Crear Inbox de WhatsApp en Chatwoot:**
   - Settings → Inboxes → Add Inbox
   - Selecciona "360Dialog WhatsApp"
   - Ingresa tu API Key
   - Configura el webhook

4. **Modificar el Workflow N8N:**
   - Agregar nodo para enviar mensajes por WhatsApp API
   - Reemplazar enlaces wa.me por envío directo

---

## 📱 Ejemplo de Nodo para Envío Directo a WhatsApp

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://waba.360dialog.io/v1/messages",
    "authentication": "headerAuth",
    "headerParameters": {
      "parameters": [
        {
          "name": "D360-API-KEY",
          "value": "={{$env.WHATSAPP_360DIALOG_API_KEY}}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "to",
          "value": "={{$json.senderPhone}}"
        },
        {
          "name": "type",
          "value": "text"
        },
        {
          "name": "text",
          "value": {
            "body": "={{$json.aiResponse}}"
          }
        }
      ]
    }
  },
  "name": "Send WhatsApp Message",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## 🎯 Checklist de Funcionamiento

- [ ] Workflow importado en N8N
- [ ] Credenciales de Chatwoot configuradas
- [ ] Workflow activado
- [ ] Webhook funcionando (recibe mensajes)
- [ ] AI Agent responde correctamente
- [ ] Se capturan datos del cliente (nombre, teléfono, email)
- [ ] Datos se guardan en Chatwoot custom attributes
- [ ] Enlaces de WhatsApp se generan correctamente
- [ ] Respuestas están personalizadas con nombre del cliente
- [ ] Contexto de conversación se mantiene

---

## 🆘 Troubleshooting

### El workflow no recibe mensajes

**Solución:**
1. Verifica que el webhook en Chatwoot apunte a ngrok:
   ```
   https://1938fab1e9b5.ngrok-free.app/webhook/chatwoot-webhook
   ```
2. Verifica que ngrok esté corriendo
3. Checa los logs de N8N: Executions

### No se guardan los datos del contacto

**Solución:**
1. Verifica las credenciales en el nodo "Update Contact Info"
2. Checa que el `senderId` se esté pasando correctamente
3. Revisa los logs del nodo

### El AI no responde o da error

**Solución:**
1. Verifica que Ollama esté corriendo:
   ```powershell
   docker ps | Select-String ollama
   ```
2. Si no está corriendo:
   ```powershell
   docker start ollama-server
   docker network connect adc_app-network ollama-server
   ```

---

## 💡 Tips y Mejores Prácticas

1. **Prueba el flujo completo** antes de dejarlo en producción
2. **Monitorea las ejecuciones** en N8N → Executions
3. **Revisa los custom attributes** en Chatwoot periódicamente
4. **Personaliza el prompt** según el feedback de los clientes
5. **Agrega más condiciones** según necesites (ej: detectar urgencias)

---

## 🎉 ¡Listo!

Ahora tienes un workflow completo que:
- ✅ Captura datos del cliente automáticamente
- ✅ Personaliza las respuestas
- ✅ Facilita la transición a WhatsApp
- ✅ Mantiene contexto de la conversación
- ✅ Guarda información para futuras interacciones

**¿Siguiente paso?** Integra WhatsApp Business API para conversaciones directas sin enlaces.
