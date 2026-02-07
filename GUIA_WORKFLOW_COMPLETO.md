# 🚀 Guía Completa de Configuración - Workflow Avanzado con Redis y PostgreSQL

## 📋 Tabla de Contenidos
1. [Resumen del Sistema](#resumen-del-sistema)
2. [Prerequisitos](#prerequisitos)
3. [Configuración de Contenedores](#configuración-de-contenedores)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Configuración de Redis](#configuración-de-redis)
6. [Importar y Configurar Workflow](#importar-y-configurar-workflow)
7. [Configuración de Webhook en Chatwoot](#configuración-de-webhook-en-chatwoot)
8. [Agregar IA para Audio e Imágenes](#agregar-ia-para-audio-e-imágenes)
9. [Pruebas del Sistema](#pruebas-del-sistema)
10. [Solución de Problemas](#solución-de-problemas)

---

## 📊 Resumen del Sistema

Este workflow implementa un sistema avanzado de chatbot con las siguientes características:

### Componentes Principales:
- ✅ **PostgreSQL (n8n-postgres)**: Almacena historial de conversaciones para memoria contextual
- ✅ **Redis (n8n-redis)**: Gestiona mensajes en tiempo real para respuestas en múltiples partes
- ✅ **N8N**: Orquestación del workflow y lógica de negocio
- ✅ **Chatwoot**: Interfaz de chat con clientes
- ✅ **Ollama** (opcional): IA local para audio/imágenes

### Flujo de Datos:
```
Usuario → Chatwoot → N8N Webhook → Procesar Tipo de Mensaje
                                        ↓
                            [Texto | Audio | Imagen]
                                        ↓
                            Redis (guardar mensajes)
                                        ↓
                            Espera 30s (consolidar)
                                        ↓
                            Recuperar mensajes de Redis
                                        ↓
                            PostgreSQL (contexto histórico)
                                        ↓
                            AI Agent (generar respuesta)
                                        ↓
                            Enviar respuesta a Chatwoot
```

---

## 🔧 Prerequisitos

1. Docker Desktop instalado y corriendo
2. Contenedores actuales funcionando:
   - Chatwoot
   - N8N
   - PostgreSQL (app)
   - Redis (app)
   - Ollama (para IA local)

---

## 🐳 Configuración de Contenedores

### Paso 1: Actualizar Variables de Entorno

Abre [.env](.env) y verifica que exista:

```env
# N8N WORKFLOW DATABASE
N8N_DB_PASSWORD=N8nWorkflow2026!Secure
```

### Paso 2: Levantar Nuevos Contenedores

```powershell
# Desde D:\ADC
docker-compose up -d n8n-postgres n8n-redis
```

### Paso 3: Verificar Estado de Contenedores

```powershell
# Ver todos los contenedores
docker ps

# Deberías ver:
# - n8n-workflow-postgres
# - n8n-workflow-redis
```

### Paso 4: Verificar Logs

```powershell
# Logs de PostgreSQL
docker logs n8n-workflow-postgres

# Logs de Redis
docker logs n8n-workflow-redis
```

---

## 🗄️ Configuración de Base de Datos

### Verificar Tabla n8n_chat_histories

La tabla se crea automáticamente al iniciar el contenedor gracias al script [migrations/n8n-init.sql](migrations/n8n-init.sql).

**Verificar manualmente:**

```powershell
# Conectar a PostgreSQL
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow

# Ver tablas
\dt

# Ver estructura de la tabla
\d n8n_chat_histories

# Salir
\q
```

**Estructura esperada:**
```sql
Column      | Type                        | Description
------------+-----------------------------+------------------
id          | SERIAL PRIMARY KEY          | ID único
session_id  | VARCHAR(255) NOT NULL       | Teléfono/Email del usuario
message     | JSONB NOT NULL              | Mensaje en formato JSON
created_at  | TIMESTAMP                   | Fecha de creación
updated_at  | TIMESTAMP                   | Última actualización
```

---

## 🔴 Configuración de Redis

### Verificar Conexión

```powershell
# Conectar a Redis
docker exec -it n8n-workflow-redis redis-cli

# Probar comandos básicos
PING  # Debe responder: PONG

# Ver todas las claves
KEYS *

# Salir
exit
```

### Estructura de Datos en Redis

El workflow usa Redis como almacenamiento temporal:

```
LISTA: {telefono_usuario}
VALORES: ["mensaje1", "mensaje2", "mensaje3", ...]
```

**Ejemplo:**
```
LISTA: "+525512345678"
VALORES: ["Hola", "Necesito duplicar una llave", "Es para un Honda Civic 2020"]
```

---

## 📥 Importar y Configurar Workflow

### Paso 1: Abrir N8N

```powershell
# Abrir en navegador
start http://localhost:5678
```

**Credenciales:**
- Usuario: `admin`
- Password: `N8nSecure2026!Admin`

### Paso 2: Importar Workflow

1. Click en **"+ New workflow"** → **"Import from File"**
2. Selecciona: `D:\ADC\n8n-workflows\automotive-keys-workflow-adaptado.json`
3. Click **"Import"**

### Paso 3: Configurar Credenciales

#### 3.1 Credencial de Redis

1. Click en nodo **"Guarda mensajes"**
2. Click en **"Credentials"** → **"Create New"**
3. Completar:
   ```
   Name: N8N Workflow Redis
   Host: n8n-redis
   Port: 6379
   Database: 0
   ```
4. Click **"Create"**

**Repetir para nodos:**
- Recupera mensajes
- Borra mensajes de BD

#### 3.2 Credencial de PostgreSQL

1. Click en nodo **"Postgres Chat Memory"**
2. Click en **"Credentials"** → **"Create New"**
3. Completar:
   ```
   Name: N8N Workflow Postgres
   Host: n8n-postgres
   Port: 5432
   Database: n8n_workflow
   User: n8n_user
   Password: N8nWorkflow2026!Secure
   SSL: Disable
   ```
4. Click **"Create"**

#### 3.3 Configurar Datos de Chatwoot

1. Click en nodo **"Datos"**
2. Modificar los valores:

**Campo `url_chatwoot`:**
```javascript
"value": "http://chatwoot:3000/"
```

**Campo `api_key_chatwoot`:**
```javascript
"value": "ggrAKhhxTdAMJMn42BwPdWnd"  // Tu API key real de Chatwoot
```

### Paso 4: Configurar AI Agent

1. Click en nodo **"AI Agent"**
2. En **"Language Model"** → Click **"+"** → Selecciona **"OpenAI Chat Model"** o **"Ollama"**

**Si usas Ollama (Local):**
```
Base URL: http://ollama-server:11434
Model: llama3
```

**Si usas OpenAI:**
```
API Key: tu-api-key-openai
Model: gpt-4
```

3. Personaliza el **System Message** en el nodo "AI Agent":
```
Eres un asistente experto en programación de llaves automotrices y duplicados. 
Tu trabajo es ayudar a los clientes a resolver sus necesidades de llaves de auto, 
explicar servicios y agendar citas.

Tus servicios incluyen:
- Programación de llaves con chip
- Duplicado de llaves convencionales
- Programación de controles remotos
- Servicio a domicilio
- Atención 24/7 para emergencias

Responde de forma clara, profesional y amigable. Si el cliente pregunta por precios 
o disponibilidad, ofrece información general y sugiere agendar una cita para una 
evaluación precisa.
```

### Paso 5: Activar Workflow

1. Click en **"Save"** (arriba a la derecha)
2. Click en el switch **"Inactive"** para activarlo
3. Copia la URL del Webhook (aparece en el nodo "Input")

**Ejemplo de URL:**
```
https://1938fab1e9b5.ngrok-free.app/webhook/automotive-keys-webhook
```

---

## 🔗 Configuración de Webhook en Chatwoot

### Opción A: Via Interfaz Web

1. Abre Chatwoot: http://localhost:3001
2. Ve a **Settings** → **Integrations** → **Webhooks**
3. Click **"Add Webhook"**
4. Completa:
   ```
   URL: https://TU-NGROK-URL/webhook/automotive-keys-webhook
   Events: message_created
   ```
5. Click **"Create"**

### Opción B: Via API (Recomendado)

```powershell
# Crear webhook
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/v1/accounts/1/webhooks" `
  -Headers @{
    "api_access_token" = "ggrAKhhxTdAMJMn42BwPdWnd"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    url = "https://TU-NGROK-URL/webhook/automotive-keys-webhook"
    subscriptions = @("message_created")
  } | ConvertTo-Json)
```

---

## 🤖 Agregar IA para Audio e Imágenes

### Opción 1: Usar Ollama (Recomendado - Gratis y Local)

#### Instalar Modelos

```powershell
# Whisper para audio
docker exec -it ollama-server ollama pull whisper

# LLaVA para imágenes
docker exec -it ollama-server ollama pull llava
```

#### Configurar en N8N

**Para Audio:**

1. Reemplaza el nodo **"response (Audio - Whisper)"** con un nodo **HTTP Request**
2. Configura:
   ```
   Method: POST
   URL: http://ollama-server:11434/api/generate
   Body:
   {
     "model": "whisper",
     "prompt": "{{ $json.data_url }}",
     "stream": false
   }
   ```

**Para Imágenes:**

1. Reemplaza el nodo **"response (Imagen - Vision)"** con un nodo **HTTP Request**
2. Configura:
   ```
   Method: POST
   URL: http://ollama-server:11434/api/generate
   Body:
   {
     "model": "llava",
     "prompt": "Describe esta imagen en detalle para un cliente de servicios automotrices",
     "images": ["{{ $json.data_url }}"],
     "stream": false
   }
   ```

### Opción 2: Usar OpenAI API (Pago)

Si prefieres usar OpenAI (mejor calidad pero de pago):

1. Agrega nodo **"OpenAI"** → **"Audio" / "Transcribe"** para audio
2. Agrega nodo **"OpenAI"** → **"Image" / "Analyze"** para imágenes

---

## 🧪 Pruebas del Sistema

### Test 1: Mensaje de Texto Simple

1. Abre el chat widget en http://localhost:3000
2. Envía: `Hola, necesito ayuda con una llave`
3. **Verifica:**
   - ✅ N8N recibe el webhook
   - ✅ Mensaje se guarda en Redis
   - ✅ Después de 30s, se procesa
   - ✅ AI Agent responde
   - ✅ Respuesta aparece en Chatwoot

### Test 2: Verificar Redis

```powershell
# Durante los 30 segundos de espera
docker exec -it n8n-workflow-redis redis-cli

# Ver la lista del usuario (reemplaza con el teléfono real)
LRANGE "+1234567890" 0 -1

# Salir
exit
```

### Test 3: Verificar PostgreSQL

```powershell
# Ver historial de conversación
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow

# Consultar mensajes guardados
SELECT session_id, message->>'type', message->>'content', created_at 
FROM n8n_chat_histories 
ORDER BY created_at DESC 
LIMIT 10;

# Salir
\q
```

### Test 4: Conversación con Contexto

1. Envía varios mensajes seguidos:
   ```
   - "Hola"
   - "Tengo un Honda Civic 2020"
   - "Perdí mi llave"
   - "¿Cuánto costaría?"
   ```

2. **Verifica que el AI recuerda el contexto:**
   - Debe recordar el modelo del auto
   - Debe entender que ya mencionaste perder la llave

---

## 🐛 Solución de Problemas

### Problema 1: No se Conecta a PostgreSQL

**Síntomas:**
- Error en nodo "Postgres Chat Memory"
- "Connection refused" o "timeout"

**Solución:**
```powershell
# Verificar que el contenedor esté corriendo
docker ps | Select-String "n8n-workflow-postgres"

# Ver logs
docker logs n8n-workflow-postgres

# Reiniciar contenedor
docker restart n8n-workflow-postgres

# Probar conexión
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "SELECT 1"
```

### Problema 2: Redis No Guarda Mensajes

**Síntomas:**
- Workflow se detiene en nodo "Guarda mensajes"
- Error de conexión a Redis

**Solución:**
```powershell
# Verificar contenedor
docker ps | Select-String "n8n-workflow-redis"

# Ver logs
docker logs n8n-workflow-redis

# Reiniciar
docker restart n8n-workflow-redis

# Probar conexión
docker exec -it n8n-workflow-redis redis-cli PING
```

### Problema 3: AI Agent No Responde

**Síntomas:**
- Workflow llega hasta "AI Agent" pero no continúa
- Error de timeout o modelo no encontrado

**Solución si usas Ollama:**
```powershell
# Verificar que llama3 esté instalado
docker exec -it ollama-server ollama list

# Si no está, instalarlo
docker exec -it ollama-server ollama pull llama3

# Ver logs de Ollama
docker logs ollama-server
```

**Solución si usas OpenAI:**
- Verifica que tu API Key sea válida
- Verifica que tengas créditos disponibles

### Problema 4: Mensajes No Llegan a Chatwoot

**Síntomas:**
- AI genera respuesta pero no aparece en chat

**Solución:**
```powershell
# Verificar que el API token sea correcto
curl http://localhost:3001/api/v1/profile `
  -H "api_access_token: ggrAKhhxTdAMJMn42BwPdWnd"

# Ver logs de Chatwoot
docker logs chatwoot

# Verificar que el account_id sea correcto (debe ser 1)
```

### Problema 5: Wait Node No Funciona

**Síntomas:**
- El nodo "Wait" no espera los 30 segundos
- Da error de webhook expiration

**Solución:**
1. Asegúrate de que el workflow esté **ACTIVO** (no en modo test)
2. Verifica que N8N tenga configurado `WEBHOOK_URL` en las variables de entorno
3. Si usas ngrok, asegúrate de que el túnel esté activo

---

## 📊 Monitoreo del Sistema

### Ver Estado de Contenedores

```powershell
# Ver recursos utilizados
docker stats n8n-workflow-postgres n8n-workflow-redis ollama-server

# Ver logs en tiempo real
docker logs -f n8n-workflow-postgres
docker logs -f n8n-workflow-redis
```

### Ver Ejecuciones en N8N

1. Abre N8N: http://localhost:5678
2. Click en **"Executions"** (barra lateral)
3. Verifica el estado de cada ejecución

### Limpiar Datos de Prueba

```powershell
# Limpiar Redis
docker exec -it n8n-workflow-redis redis-cli FLUSHALL

# Limpiar PostgreSQL
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "TRUNCATE TABLE n8n_chat_histories"
```

---

## 🎯 Próximos Pasos

1. ✅ **Personalizar Prompts del AI Agent** según tu negocio
2. ✅ **Implementar Whisper/LLaVA** para audio e imágenes
3. ✅ **Agregar más lógica** (horarios, precios, agendamiento)
4. ✅ **Configurar SMTP** para notificaciones de Chatwoot
5. ✅ **Producción**: Migrar de ngrok a dominio real con SSL

---

## 📚 Archivos de Referencia

- [docker-compose.yml](docker-compose.yml) - Configuración de contenedores
- [.env](.env) - Variables de entorno
- [migrations/n8n-init.sql](migrations/n8n-init.sql) - Script de inicialización DB
- [n8n-workflows/automotive-keys-workflow-adaptado.json](n8n-workflows/automotive-keys-workflow-adaptado.json) - Workflow base
- [ALTERNATIVAS_IA_OPENSOURCE.md](ALTERNATIVAS_IA_OPENSOURCE.md) - Guía de IA open source

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la sección [Solución de Problemas](#solución-de-problemas)
2. Verifica los logs de cada contenedor
3. Asegúrate de que todos los contenedores estén corriendo
4. Revisa las credenciales en N8N

**Comando útil para reiniciar todo:**
```powershell
docker-compose restart
```
