# 📋 Configuraciones JSON Listas para Copiar/Pegar en N8N

## 🖼️ Nodo para Analizar Imagen con LLaVA

### Nombre: "Analizar Imagen LLaVA"

```json
{
  "parameters": {
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
    "jsonBody": "={\n  \"model\": \"llava\",\n  \"prompt\": \"Describe esta imagen con todo detalle. ¿Qué elementos importantes se pueden ver? Si es una llave automotriz, describe el tipo y modelo.\",\n  \"images\": [\"{{ $json.data_url.includes(',') ? $json.data_url.split(',')[1] : $json.data_url }}\"],\n  \"stream\": false\n}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1200, 400],
  "name": "Analizar Imagen LLaVA"
}
```

**Salida:** `$json.response` contiene la descripción de la imagen

---

## 🎙️ Nodo para Transcribir Audio con Faster-Whisper

### Paso 1: Descargar Audio (si viene como URL)

```json
{
  "parameters": {
    "method": "GET",
    "url": "={{ $json.data_url }}",
    "options": {
      "response": {
        "response": {
          "responseFormat": "file"
        }
      }
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1000, 300],
  "name": "Descargar Audio"
}
```

### Paso 2: Transcribir con Faster-Whisper

```json
{
  "parameters": {
    "method": "POST",
    "url": "http://faster-whisper:8000/v1/audio/transcriptions",
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
        },
        {
          "name": "response_format",
          "value": "json"
        }
      ]
    },
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1200, 300],
  "name": "Transcribir Audio Whisper"
}
```

**Salida:** `$json.text` contiene el texto transcrito

---

## 🤖 Nodo Ollama Chat Model (para AI Agent)

### Para usar en el nodo "AI Facu" o similar

**En la interfaz de N8N:**
1. Busca: "Ollama Chat Model"
2. NO uses "OpenAI Chat Model"
3. Configura estos parámetros:

**Base URL:** `http://ollama-server:11434`
**Model:** `llama3`
**Temperature:** `0.7`

### JSON del Nodo:

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
  "position": [2000, 400],
  "name": "Ollama Model"
}
```

---

## 📝 Nodo Ollama Chat Model (para Format Chain)

### Para formateo de texto (temperatura baja)

```json
{
  "parameters": {
    "baseUrl": "http://ollama-server:11434",
    "model": "llama3",
    "options": {
      "temperature": 0.2,
      "numPredict": 1500
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
  "typeVersion": 1,
  "position": [2000, 600],
  "name": "Ollama Format Model"
}
```

---

## 🔄 Nodo para Extraer Respuesta de LLaVA

Después del nodo de LLaVA, agrega un nodo "Set" para extraer la respuesta:

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "response-image",
          "name": "response",
          "value": "={{ $json.response }}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [1400, 400],
  "name": "response (Imagen)"
}
```

---

## 🔄 Nodo para Extraer Respuesta de Whisper

Después del nodo de Whisper, agrega un nodo "Set" para extraer el texto:

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "response-audio",
          "name": "response",
          "value": "={{ $json.text }}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [1400, 300],
  "name": "response (Audio)"
}
```

---

## 🎯 Pasos para Aplicar en N8N

### 1. Abrir N8N
```powershell
start http://localhost:5678
```

### 2. Editar el Workflow

Para **cada nodo de OpenAI**:

#### A) Reemplazar Nodos de Imagen (OpenAI, OpenAI2):

1. **Eliminar** el nodo OpenAI
2. **Agregar** → Buscar "HTTP Request"
3. Click en el nodo → **Settings** (⚙️)
4. **Copy/Paste** la configuración JSON del nodo "Analizar Imagen LLaVA" de arriba
5. Conectar igual que el nodo anterior

#### B) Reemplazar Nodo de Audio (OpenAI1):

1. **Eliminar** el nodo OpenAI1
2. **Agregar** dos nodos:
   - HTTP Request (Descargar Audio)
   - HTTP Request (Transcribir Audio Whisper)
3. Conectar en secuencia
4. Copy/Paste las configuraciones de arriba

#### C) Reemplazar Modelos de Chat (OpenAI Model1, OpenAI Chat Model, OpenAI Chat Model2):

1. **Eliminar** el nodo de OpenAI
2. **Agregar** → Buscar "**Ollama Chat Model**" (en la categoría AI)
3. Configurar:
   - **Base URL**: `http://ollama-server:11434`
   - **Model**: `llama3`
   - **Temperature**: `0.7` (para conversación) o `0.2` (para formateo)
4. **NO crear credenciales** - dejar en blanco
5. Conectar al nodo que necesita el modelo (AI Agent, Format Chain, etc.)

---

## 🧪 Probar Configuraciones

### Probar LLaVA desde PowerShell:

```powershell
# Preparar una imagen de prueba en base64
$imageBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\a\imagen.jpg"))

# Hacer request
$body = @{
    model = "llava"
    prompt = "Describe esta imagen"
    images = @($imageBase64)
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:11434/api/generate" `
  -Body $body `
  -ContentType "application/json"
```

### Probar Faster-Whisper:

```powershell
# Primero levantar el contenedor
docker-compose up -d faster-whisper

# Esperar 30 segundos para que inicie

# Probar con un audio
curl.exe -X POST http://localhost:8000/v1/audio/transcriptions `
  -F "file=@audio.mp3" `
  -F "model=tiny" `
  -F "language=es"
```

### Probar Llama3:

```powershell
docker exec -it ollama-server ollama run llama3 "Hola"
```

---

## ⚠️ Notas Importantes

### 1. Formato de Imágenes

**LLaVA necesita base64 puro (sin prefijo):**

❌ Incorrecto: `data:image/jpeg;base64,/9j/4AAQ...`
✅ Correcto: `/9j/4AAQ...`

**Solución en N8N:**
```javascript
{{ $json.data_url.includes(',') ? $json.data_url.split(',')[1] : $json.data_url }}
```

### 2. Tamaño de Modelos

- **tiny**: Rápido pero menos preciso (recomendado para desarrollo)
- **base**: Balance entre velocidad y precisión
- **small**: Más preciso pero más lento
- **medium/large**: Máxima precisión pero muy lento

Para Faster-Whisper puedes cambiar el modelo en docker-compose.yml:
```yaml
environment:
  - WHISPER_MODEL=base  # o small, medium, large
```

### 3. Sin Credenciales

Al usar Ollama Chat Model con `baseUrl`, **NO necesitas**:
- ❌ API Keys
- ❌ Tokens
- ❌ Credenciales

Solo asegúrate que:
- ✅ `ollama-server` esté corriendo
- ✅ Los contenedores estén en la misma red (`app-network`)

### 4. HTTP Request13 (WhatsApp API)

Si usas Chatwoot, **NO necesitas este nodo** porque:
- Chatwoot ya procesa archivos de WhatsApp
- El `data_url` viene listo para usar en el webhook

Solo úsalo si `data_url` es una URL externa que necesita descargarse.

---

## 📦 Levantar Faster-Whisper

```powershell
# Desde D:\ADC
docker-compose up -d faster-whisper

# Verificar que esté corriendo
docker ps | Select-String "faster-whisper"

# Ver logs
docker logs faster-whisper-server

# Probar que responda
Invoke-RestMethod http://localhost:8000/health
```

---

## 🔗 Referencias

- **Ollama API**: http://localhost:11434/api/generate
- **Faster-Whisper API**: http://localhost:8000/v1/audio/transcriptions
- **N8N**: http://localhost:5678
- **Chatwoot**: http://localhost:3001

---

## ✅ Checklist Final

- [ ] Levantar contenedor faster-whisper
- [ ] En N8N: Eliminar nodos de OpenAI
- [ ] Agregar nodos HTTP Request para LLaVA (x2)
- [ ] Agregar nodos HTTP Request para Whisper (x2)
- [ ] Agregar nodos Ollama Chat Model (x3)
- [ ] Configurar Base URL en Ollama: `http://ollama-server:11434`
- [ ] Probar cada nodo con datos de ejemplo
- [ ] Conectar nodos según flujo original
- [ ] Guardar workflow
- [ ] Activar workflow
- [ ] Probar con mensaje real desde Chatwoot

---

¿Necesitas que te ayude a configurar algún nodo específico en N8N paso a paso?
