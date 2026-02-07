# 🔄 Guía de Reemplazo de Nodos OpenAI por Ollama

## 📋 Tabla de Reemplazos

| Nodo Original | Reemplazar Por | Modelo Ollama | Propósito |
|--------------|----------------|---------------|-----------|
| OpenAI (analyze image) | HTTP Request | llava | Analizar imágenes |
| OpenAI1 (Transcribe) | HTTP Request | dimavz/whisper-tiny | Transcribir audio |
| OpenAI2 (analyze image) | HTTP Request | llava | Analizar imágenes |
| HTTP Request13 (WA API) | HTTP Request | - | Obtener archivo de Chatwoot |
| OpenAI Model1 | Ollama Chat Model | llama3 | Modelo IA para agente |
| OpenAI Chat Model | Ollama Chat Model | llama3 | Modelo IA para formateo |
| OpenAI Chat Model2 | Ollama Chat Model | llama3 | Modelo IA para formateo |

---

## 1️⃣ OpenAI (analyze image) → HTTP Request con LLaVA

### Configuración del Nodo HTTP Request

**Tipo de Nodo:** `n8n-nodes-base.httpRequest`

**Parámetros:**
```json
{
  "method": "POST",
  "url": "http://ollama-server:11434/api/generate",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "={\n  \"model\": \"llava\",\n  \"prompt\": \"Describe esta imagen con todo detalle. ¿Qué elementos importantes se pueden ver?\",\n  \"images\": [\"{{ $('Datos').item.json.data_url.split(',')[1] || $('Datos').item.json.data_url }}\"],\n  \"stream\": false\n}",
  "options": {}
}
```

**Importante:** 
- Si `data_url` viene con prefijo `data:image/jpeg;base64,`, usar: `$('Datos').item.json.data_url.split(',')[1]`
- Si ya es base64 puro, usar: `$('Datos').item.json.data_url`

**Salida esperada:**
El resultado estará en `$json.response` (la descripción de la imagen)

---

## 2️⃣ OpenAI1 (Transcribe Recording) → HTTP Request con Whisper

### Opción A: Si el audio viene como URL

**Primero agregar un nodo HTTP Request para descargar el audio:**

```json
{
  "method": "GET",
  "url": "={{ $('Input').item.json.body.attachments[0].data_url }}",
  "options": {
    "response": {
      "response": {
        "responseFormat": "file"
      }
    }
  }
}
```

### Opción B: Transcripción con Whisper en Ollama

**NOTA:** El Whisper de Ollama tiene limitaciones. Es mejor usar la API de Whisper directamente o un servicio HTTP.

**Alternativa Recomendada - Usar Faster-Whisper via Docker:**

Primero agregar este servicio a [docker-compose.yml](docker-compose.yml):

```yaml
  faster-whisper:
    image: fedirz/faster-whisper-server:latest-cpu
    container_name: faster-whisper-server
    ports:
      - "8000:8000"
    environment:
      - WHISPER_MODEL=tiny
    networks:
      - app-network
    restart: unless-stopped
```

**Luego usar este nodo HTTP Request:**

```json
{
  "method": "POST",
  "url": "http://faster-whisper:8000/v1/audio/transcriptions",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "multipart/form-data"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "file",
        "parameterType": "formBinaryData",
        "inputDataFieldName": "data"
      },
      {
        "name": "model",
        "value": "tiny"
      },
      {
        "name": "language",
        "value": "es"
      }
    ]
  }
}
```

**Salida esperada:**
El texto transcrito estará en `$json.text`

---

## 3️⃣ OpenAI2 (analyze image) → HTTP Request con LLaVA

**Misma configuración que el nodo #1:**

```json
{
  "method": "POST",
  "url": "http://ollama-server:11434/api/generate",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "={\n  \"model\": \"llava\",\n  \"prompt\": \"Describe esta imagen con todo detalle para un cliente de servicios automotrices\",\n  \"images\": [\"{{ $('Datos').item.json.data_url.split(',')[1] || $('Datos').item.json.data_url }}\"],\n  \"stream\": false\n}",
  "options": {}
}
```

---

## 4️⃣ HTTP Request13 (Get WhatsApp API) → HTTP Request para Chatwoot

Este nodo descarga archivos multimedia de WhatsApp. Como estás usando Chatwoot, el `data_url` ya viene en el webhook.

**Opción 1: Si data_url es una URL externa (necesita descarga):**

```json
{
  "method": "GET",
  "url": "={{ $('Input').item.json.body.attachments[0].data_url }}",
  "options": {
    "response": {
      "response": {
        "responseFormat": "file"
      }
    }
  }
}
```

**Opción 2: Si data_url ya es base64:**

No necesitas este nodo, puedes usar directamente `$('Input').item.json.body.attachments[0].data_url`

---

## 5️⃣ OpenAI Model1 → Ollama Chat Model

### En N8N Interface:

1. **Eliminar** el nodo "OpenAI Model1"
2. **Agregar** un nuevo nodo: busca "Ollama Chat Model"
3. **Configurar:**

**Sin Credenciales (conexión directa):**
```json
{
  "baseUrl": "http://ollama-server:11434",
  "model": "llama3",
  "options": {
    "temperature": 0.7
  }
}
```

### JSON del Nodo Completo:

```json
{
  "parameters": {
    "baseUrl": "http://ollama-server:11434",
    "model": "llama3",
    "options": {
      "temperature": 0.7,
      "numPredict": 2000
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
  "typeVersion": 1,
  "position": [x, y],
  "id": "nuevo-id",
  "name": "Ollama Chat Model"
}
```

**NO requiere credenciales** si usas `baseUrl` directamente.

---

## 6️⃣ OpenAI Chat Model → Ollama Chat Model

**Misma configuración que #5:**

```json
{
  "parameters": {
    "baseUrl": "http://ollama-server:11434",
    "model": "llama3",
    "options": {
      "temperature": 0.3
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
  "typeVersion": 1,
  "position": [x, y],
  "id": "nuevo-id-2",
  "name": "Ollama Chat Model1"
}
```

---

## 7️⃣ OpenAI Chat Model2 → Ollama Chat Model

**Para el nodo de formateo (usa temperatura baja para más precisión):**

```json
{
  "parameters": {
    "baseUrl": "http://ollama-server:11434",
    "model": "llama3",
    "options": {
      "temperature": 0.1,
      "numPredict": 1000
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
  "typeVersion": 1,
  "position": [x, y],
  "id": "nuevo-id-3",
  "name": "Ollama Chat Model2"
}
```

---

## 🎯 Pasos para Reemplazar en N8N

### Método Manual (Recomendado):

1. **Abre el workflow** en N8N
2. Para cada nodo de OpenAI:
   - Click derecho → **Delete**
3. **Agrega el nodo de reemplazo:**
   - Para imágenes/audio: **HTTP Request**
   - Para modelos de chat: **Ollama Chat Model** (buscar en "AI")
4. **Configura los parámetros** según las tablas de arriba
5. **Conecta** los nodos igual que estaban antes
6. **Guarda** el workflow

### Método por JSON:

Si prefieres editar el JSON directamente:

1. **Exporta** el workflow actual
2. **Busca y reemplaza** los nodos usando un editor de texto
3. **Importa** el workflow modificado

---

## 🧪 Probar los Nodos

### Probar LLaVA (Análisis de Imagen):

```powershell
# Desde PowerShell
$body = @{
    model = "llava"
    prompt = "Describe esta imagen"
    images = @("base64_string_aqui")
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:11434/api/generate" `
  -Body $body `
  -ContentType "application/json"
```

### Probar Whisper (Transcripción):

```powershell
# Si instalas faster-whisper
# Primero levantar el servicio:
docker-compose up -d faster-whisper

# Luego probar con un archivo de audio
curl -X POST http://localhost:8000/v1/audio/transcriptions `
  -F "file=@audio.mp3" `
  -F "model=tiny" `
  -F "language=es"
```

### Probar Llama3:

```powershell
docker exec -it ollama-server ollama run llama3 "Hola, ayúdame con programación de llaves automotrices"
```

---

## 📝 Configuración Específica para Tu Workflow

### Nodo "response (Audio)" después de transcripción:

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "audio-response",
          "name": "response",
          "value": "={{ $json.text || $json.response }}",
          "type": "string"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "name": "response (Audio)"
}
```

### Nodo "response (Imagen)" después de análisis:

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "image-response",
          "name": "response",
          "value": "={{ $json.response }}",
          "type": "string"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "name": "response (Imagen)"
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Base64 de Imágenes**

Chatwoot puede enviar `data_url` de dos formas:

- **Con prefijo**: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
- **Sin prefijo**: `/9j/4AAQSkZJRg...`

LLaVA necesita **solo la parte base64** (sin prefijo). Usa:

```javascript
{{ $('Datos').item.json.data_url.split(',')[1] || $('Datos').item.json.data_url }}
```

### 2. **Transcripción de Audio**

Whisper en Ollama no está optimizado. **Recomiendo usar faster-whisper** (agregarlo al docker-compose):

```yaml
faster-whisper:
  image: fedirz/faster-whisper-server:latest-cpu
  container_name: faster-whisper-server
  ports:
    - "8000:8000"
  environment:
    - WHISPER_MODEL=tiny
  networks:
    - app-network
```

### 3. **Modelos Ollama**

Ya tienes instalados:
- ✅ `llama3` - Para el AI Agent
- ✅ `llava` - Para análisis de imágenes
- ✅ `dimavz/whisper-tiny` - Para audio (limitado)

### 4. **Sin Credenciales**

Al usar `baseUrl` directamente en Ollama Chat Model, **NO necesitas crear credenciales**. Solo asegúrate de que:

- El contenedor `ollama-server` esté en la misma red (`app-network`)
- La URL sea: `http://ollama-server:11434`

---

## 🔧 Actualizar docker-compose.yml

Agrega el servicio de Faster-Whisper:

```yaml
  faster-whisper:
    image: fedirz/faster-whisper-server:latest-cpu
    container_name: faster-whisper-server
    ports:
      - "8000:8000"
    environment:
      - WHISPER_MODEL=tiny
      - WHISPER_IMPLEMENTATION=faster-whisper
    networks:
      - app-network
    restart: unless-stopped
```

Luego levanta el contenedor:

```powershell
docker-compose up -d faster-whisper
```

---

## 📊 Resumen de URLs

| Servicio | URL Interna (desde N8N) | Puerto Externo |
|----------|------------------------|----------------|
| Ollama | `http://ollama-server:11434` | 11434 |
| Faster-Whisper | `http://faster-whisper:8000` | 8000 |
| Chatwoot | `http://chatwoot:3000` | 3001 |

---

## ✅ Checklist de Reemplazo

- [ ] Reemplazar OpenAI (imagen) → HTTP Request con LLaVA
- [ ] Reemplazar OpenAI1 (audio) → HTTP Request con Faster-Whisper
- [ ] Reemplazar OpenAI2 (imagen) → HTTP Request con LLaVA
- [ ] Actualizar HTTP Request13 (usar data_url de Chatwoot)
- [ ] Reemplazar OpenAI Model1 → Ollama Chat Model (llama3)
- [ ] Reemplazar OpenAI Chat Model → Ollama Chat Model (llama3)
- [ ] Reemplazar OpenAI Chat Model2 → Ollama Chat Model (llama3)
- [ ] Agregar faster-whisper a docker-compose.yml
- [ ] Probar cada nodo individualmente
- [ ] Guardar y activar workflow

---

¿Necesitas ayuda con algún nodo específico? Puedo mostrarte paso a paso cómo configurarlo en la interfaz de N8N.
