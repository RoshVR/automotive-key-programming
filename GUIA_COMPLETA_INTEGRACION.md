# 🚀 Guía Completa: Conectar Página Web con Chatwoot y N8N + Agente IA

## 📋 Resumen de la Integración

Esta guía te ayudará a:
1. ✅ Solucionar el problema de Chatwoot que no inicia
2. ✅ Configurar PostgreSQL y Redis correctamente
3. ✅ Conectar el chat de tu página a Chatwoot
4. ✅ Integrar N8N con Chatwoot
5. ✅ Conectar un agente de IA para respuestas automáticas

---

## 🔧 PASO 1: Preparar el Entorno

### 1.1 Detener contenedores actuales

```powershell
cd D:\ADC
docker-compose down -v
docker stop Chatwoot
docker rm Chatwoot
```

### 1.2 Verificar archivo .env

El archivo `.env` ya está configurado con:
- ✅ Credenciales de PostgreSQL
- ✅ Configuración de N8N
- ✅ Configuración de Chatwoot
- ✅ Secret key para Chatwoot

**IMPORTANTE:** Cambia estas variables antes de iniciar:
```env
# En .env, actualiza:
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password-de-aplicacion-gmail
```

Para obtener password de aplicación de Gmail:
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Cópiala en el .env

---

## 🐳 PASO 2: Iniciar los Contenedores

### 2.1 Construir e iniciar servicios

```powershell
# Desde D:\ADC
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 2.2 Verificar que todos estén corriendo

```powershell
docker-compose ps
```

Deberías ver:
- ✅ **postgres** - Running (healthy)
- ✅ **redis** - Running
- ✅ **chatwoot-postgres** - Running
- ✅ **chatwoot-redis** - Running
- ✅ **chatwoot** - Running (puerto 3001)
- ✅ **chatwoot-sidekiq** - Running
- ✅ **n8n** - Running (puerto 5678)
- ✅ **app** - Running (puerto 3000)

### 2.3 Si Chatwoot no inicia, ver logs

```powershell
docker-compose logs chatwoot
docker-compose logs chatwoot-sidekiq
```

**Problema común:** Si da error de base de datos, ejecuta:

```powershell
docker-compose exec chatwoot bundle exec rails db:create
docker-compose exec chatwoot bundle exec rails db:schema:load
docker-compose exec chatwoot bundle exec rails db:seed
```

---

## 📱 PASO 3: Configurar Chatwoot

### 3.1 Acceder a Chatwoot

1. Abre: http://localhost:3001
2. Completa el formulario de instalación inicial:
   - **Nombre completo:** Tu nombre
   - **Email:** tu-email@gmail.com
   - **Password:** Crea una contraseña segura
   - **Nombre de la empresa:** Automotive Keys

### 3.2 Crear un Inbox (Bandeja de entrada)

1. En Chatwoot, ve a **Settings > Inboxes**
2. Click en **Add Inbox**
3. Selecciona **Website**
4. Configura:
   - **Website Name:** Automotive Keys Website
   - **Website Domain:** localhost:3000
5. Click **Create**

### 3.3 Obtener el Website Token

1. Después de crear el inbox, copia el **Website Token**
2. Abre [public/index.html](public/index.html)
3. Busca la línea:
   ```javascript
   websiteToken: 'YOUR_WEBSITE_TOKEN',
   ```
4. Reemplaza `YOUR_WEBSITE_TOKEN` con tu token real

### 3.4 Configurar Webhook en Chatwoot

1. En Chatwoot, ve a **Settings > Integrations > Webhooks**
2. Click **Add Webhook**
3. Configura:
   - **Endpoint URL:** `http://n8n:5678/webhook/chatwoot-webhook`
   - **Events:** Selecciona "message_created"
4. Click **Save**

### 3.5 Obtener API Access Token

1. En Chatwoot, ve a **Profile Settings > Access Token**
2. Click **Generate Token**
3. Copia el token
4. Actualiza el `.env`:
   ```env
   CHATWOOT_API_TOKEN=tu_token_aqui
   ```

---

## 🤖 PASO 4: Configurar N8N

### 4.1 Acceder a N8N

1. Abre: http://localhost:5678
2. Login:
   - **Usuario:** admin
   - **Password:** N8nSecure2026!Admin

### 4.2 Importar el Workflow

1. En N8N, click en **+** para crear nuevo workflow
2. Click en el menú (⋮) > **Import from File**
3. Selecciona: `n8n-workflows/chatwoot-ai-agent-workflow.json`
4. Click **Import**

### 4.3 Configurar Credenciales de Chatwoot

1. En el nodo **Send Response to Chatwoot**:
2. Click en **Credentials for HTTP Header Auth**
3. Click **Create New**
4. Configura:
   - **Name:** Chatwoot API
   - **Header Name:** api_access_token
   - **Header Value:** [Tu token de Chatwoot del paso 3.5]
5. Click **Save**

### 4.4 Configurar Variables de Entorno en N8N

1. En N8N, ve a **Settings > Environment Variables**
2. Agrega:
   ```
   CHATWOOT_ACCOUNT_ID=1
   ```
   (Normalmente es 1 si es la primera cuenta)

### 4.5 Activar el Workflow

1. En el workflow importado
2. Click en el botón **Active** (arriba a la derecha)
3. Copia la URL del webhook que aparece en el nodo "Chatwoot Webhook"

---

## 🧪 PASO 5: Probar el Agente de IA

### 5.1 Configurar Ollama (Opcional pero recomendado)

Si tienes Ollama instalado:

```powershell
# Asegúrate de que Ollama esté corriendo
docker start ollama-server

# Verificar que el modelo llama3 esté disponible
docker exec ollama-server ollama list
```

Si necesitas instalar el modelo:
```powershell
docker exec ollama-server ollama pull llama3
```

### 5.2 Alternativa: Usar OpenAI o Claude

Si prefieres usar OpenAI o Claude en lugar de Ollama:

1. En N8N, reemplaza el nodo **AI Agent (Ollama)** por un nodo HTTP Request
2. Configura para la API de tu elección:

**Para OpenAI:**
```json
{
  "method": "POST",
  "url": "https://api.openai.com/v1/chat/completions",
  "authentication": "headerAuth",
  "headers": {
    "Authorization": "Bearer YOUR_OPENAI_API_KEY"
  },
  "body": {
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "Eres un asistente para un servicio de programación de llaves automotrices."
      },
      {
        "role": "user",
        "content": "={{$json.content}}"
      }
    ]
  }
}
```

### 5.3 Probar el Chat

1. Abre tu página: http://localhost:3000
2. Click en el botón **Chat** (arriba a la derecha)
3. El widget de Chatwoot debería aparecer
4. Envía un mensaje de prueba: "Hola, necesito información sobre programación de llaves"
5. El agente de IA debería responder automáticamente

---

## 🔍 PASO 6: Verificación y Troubleshooting

### 6.1 Verificar que todo funciona

```powershell
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs específicos
docker-compose logs chatwoot
docker-compose logs n8n
docker-compose logs app
```

### 6.2 Problemas Comunes y Soluciones

#### ❌ **Problema: Chatwoot no inicia**

**Solución 1:** Verificar la base de datos
```powershell
docker-compose exec chatwoot-postgres psql -U postgres -d chatwoot_production -c "\dt"
```

Si no hay tablas, ejecuta:
```powershell
docker-compose exec chatwoot bundle exec rails db:prepare
docker-compose exec chatwoot bundle exec rails db:seed
```

**Solución 2:** Limpiar y reiniciar
```powershell
docker-compose down
docker volume rm adc_chatwoot_postgres_data
docker volume rm adc_chatwoot_redis_data
docker-compose up -d
```

#### ❌ **Problema: El widget de Chatwoot no aparece**

**Soluciones:**
1. Verifica que el WEBSITE_TOKEN esté correcto en [public/index.html](public/index.html)
2. Verifica que Chatwoot esté corriendo: http://localhost:3001
3. Abre la consola del navegador (F12) y busca errores
4. Verifica CORS en Chatwoot: Settings > Account Settings > Allowed Domains
   - Agrega: `http://localhost:3000`

#### ❌ **Problema: N8N no recibe webhooks de Chatwoot**

**Soluciones:**
1. Verifica que el webhook esté configurado en Chatwoot
2. Verifica la URL del webhook: debe ser accesible desde el contenedor de Chatwoot
3. Usa `http://n8n:5678` en lugar de `http://localhost:5678` en el webhook de Chatwoot
4. Prueba el webhook manualmente:
```powershell
curl -X POST http://localhost:5678/webhook/chatwoot-webhook -H "Content-Type: application/json" -d '{"message_type":"incoming","content":"test"}'
```

#### ❌ **Problema: El agente no responde**

**Soluciones:**
1. Verifica que Ollama esté corriendo (si usas Ollama)
2. Verifica los logs de N8N: busca errores en la ejecución del workflow
3. Prueba el modelo de IA manualmente:
```powershell
docker exec ollama-server ollama run llama3 "Hola, ¿cómo estás?"
```

---

## 🎨 PASO 7: Personalización del Agente

### 7.1 Personalizar el Prompt del Agente

1. En N8N, abre el workflow
2. Click en el nodo **AI Agent (Ollama)**
3. Modifica el prompt en el parámetro `prompt`:

```javascript
Eres un asistente experto en programación de llaves automotrices con 10 años de experiencia.

INFORMACIÓN DEL SERVICIO:
- Programamos llaves para TODAS las marcas
- Servicio a domicilio disponible
- Tiempo promedio: 30-45 minutos
- Garantía de 1 año
- Precio desde $150 USD

HORARIOS:
- Lunes a Viernes: 8:00 AM - 8:00 PM
- Sábados: 9:00 AM - 6:00 PM
- Domingos: 10:00 AM - 4:00 PM

Cliente pregunta: {{$json.content}}

Responde de manera profesional, amigable y concisa. Si el cliente quiere agendar una cita, solicita:
1. Marca y modelo del vehículo
2. Año del vehículo
3. Fecha y hora preferida
4. Dirección (si quiere servicio a domicilio)
```

### 7.2 Agregar Memoria Contextual

Para que el agente recuerde conversaciones anteriores, modifica el nodo **Process Message Data**:

```javascript
// En el nodo Process Message Data, agrega:

const previousMessages = messageData.conversation?.messages || [];
const conversationContext = previousMessages
  .slice(-5)  // Últimos 5 mensajes
  .map(msg => `${msg.sender?.name}: ${msg.content}`)
  .join('\n');

// Incluye esto en el prompt del agente
```

---

## 📊 PASO 8: Monitoreo y Analytics

### 8.1 Ver Métricas en Chatwoot

1. En Chatwoot, ve a **Reports**
2. Verás:
   - Conversaciones totales
   - Tiempo de respuesta promedio
   - Tasa de resolución
   - Mensajes por día

### 8.2 Ver Ejecuciones en N8N

1. En N8N, ve a **Executions**
2. Verás todas las ejecuciones del workflow
3. Click en cada ejecución para ver detalles y debug

---

## 🔒 PASO 9: Seguridad (Para Producción)

### 9.1 Cambiar todas las contraseñas

En `.env`, actualiza:
```env
DB_PASSWORD=<contraseña-fuerte-unica>
N8N_PASSWORD=<contraseña-fuerte-unica>
CHATWOOT_SECRET_KEY_BASE=$(openssl rand -hex 64)
```

### 9.2 Configurar HTTPS

En producción, necesitarás:
1. Un dominio (ejemplo: tudominio.com)
2. Certificados SSL (usar Let's Encrypt)
3. Actualizar nginx.conf para SSL
4. Actualizar .env:
```env
CHATWOOT_HOST=chat.tudominio.com
N8N_HOST=n8n.tudominio.com
FRONTEND_URL=https://chat.tudominio.com
N8N_PROTOCOL=https
```

---

## 🎯 PASO 10: Próximos Pasos y Mejoras

### Integraciones Adicionales

1. **WhatsApp Business:**
   - Conecta WhatsApp a Chatwoot
   - Agrega canal de WhatsApp en Settings > Inboxes

2. **Telegram:**
   - Crea un bot de Telegram
   - Conecta a Chatwoot

3. **Facebook Messenger:**
   - Conecta tu página de Facebook
   - Centraliza todo en Chatwoot

### Automatizaciones Avanzadas

1. **Agendamiento Automático:**
   - Modifica el workflow de N8N
   - Conecta con Google Calendar API
   - Envía confirmaciones por email/SMS

2. **Clasificación Inteligente:**
   - Usa IA para clasificar consultas
   - Asigna automáticamente a agentes específicos
   - Prioriza emergencias

3. **Respuestas Predefinidas:**
   - Configura "Canned Responses" en Chatwoot
   - Crea templates para preguntas frecuentes

---

## 📝 Resumen de URLs y Credenciales

| Servicio | URL | Usuario | Password |
|----------|-----|---------|----------|
| **Página Web** | http://localhost:3000 | - | - |
| **Chatwoot** | http://localhost:3001 | (tu email) | (tu password) |
| **N8N** | http://localhost:5678 | admin | N8nSecure2026!Admin |
| **PostgreSQL (App)** | localhost:5432 | postgres | AutomotiveKeys2026!Secure |
| **PostgreSQL (Chatwoot)** | localhost:5432 | postgres | AutomotiveKeys2026!Secure |
| **Redis** | localhost:6379 | - | - |

---

## 🆘 Soporte y Ayuda

Si tienes problemas:

1. **Revisa los logs:**
   ```powershell
   docker-compose logs -f [servicio]
   ```

2. **Reinicia los contenedores:**
   ```powershell
   docker-compose restart [servicio]
   ```

3. **Reconstruye desde cero:**
   ```powershell
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## ✅ Checklist Final

Antes de considerar la instalación completa:

- [ ] Todos los contenedores están corriendo
- [ ] Chatwoot accesible en http://localhost:3001
- [ ] N8N accesible en http://localhost:5678
- [ ] Página web accesible en http://localhost:3000
- [ ] Widget de Chatwoot aparece en la página
- [ ] Puedes enviar mensajes en el chat
- [ ] El agente de IA responde automáticamente
- [ ] Webhook de Chatwoot a N8N funciona
- [ ] Credenciales de producción actualizadas (si aplica)

---

## 🎉 ¡Listo!

Tu sistema está completamente integrado:
- ✅ Chat en tu página web (Chatwoot)
- ✅ Agente de IA automático (N8N + Ollama/OpenAI)
- ✅ Base de datos persistente (PostgreSQL)
- ✅ Caché y jobs (Redis)
- ✅ Todo en contenedores Docker

**¿Necesitas ayuda adicional?** Revisa los logs y la documentación oficial:
- Chatwoot: https://www.chatwoot.com/docs
- N8N: https://docs.n8n.io
