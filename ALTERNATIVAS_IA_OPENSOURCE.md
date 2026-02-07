# Alternativas Open Source / Gratuitas para IA en el Workflow

## 🎙️ Transcripción de Audio (Alternativas a OpenAI Whisper)

### 1. **Whisper de OpenAI (Open Source) - RECOMENDADO**
- **Descripción**: Modelo de transcripción de código abierto de OpenAI
- **Instalación**: Se puede ejecutar localmente con Ollama o via Docker
- **Ventajas**: 
  - Completamente gratis
  - Muy preciso (soporta 99 idiomas)
  - Varios tamaños de modelo (tiny, base, small, medium, large)
  - Funciona offline
- **Desventajas**: Requiere GPU para modelos grandes (CPU funciona pero más lento)

#### Instalación con Ollama (Recomendado):
```bash
# Desde el contenedor de Ollama o instalación local
docker exec -it ollama-server ollama pull whisper

# O si tienes Ollama instalado localmente
ollama pull whisper
```

#### Uso en N8N:
```javascript
// Nodo HTTP Request a Ollama
// URL: http://ollama-server:11434/api/generate
// Método: POST
// Body:
{
  "model": "whisper",
  "prompt": "<audio_base64>",
  "stream": false
}
```

### 2. **Faster-Whisper (Optimizado)**
- **Descripción**: Implementación más rápida de Whisper usando CTranslate2
- **GitHub**: https://github.com/guillaumekln/faster-whisper
- **Ventajas**: 4x más rápido que Whisper original, mismo nivel de precisión
- **Instalación Docker**:
```dockerfile
FROM python:3.10-slim
RUN pip install faster-whisper
CMD ["python", "transcribe.py"]
```

### 3. **Vosk (Offline Speech Recognition)**
- **Descripción**: Sistema de reconocimiento de voz offline
- **Website**: https://alphacephei.com/vosk/
- **Ventajas**: 
  - Muy ligero (modelos de 50MB a 1GB)
  - Funciona completamente offline
  - API simple
- **Desventajas**: Menos preciso que Whisper

---

## 🖼️ Análisis de Imágenes (Alternativas a GPT-4 Vision)

### 1. **LLaVA (Large Language and Vision Assistant) - RECOMENDADO**
- **Descripción**: Modelo open source para visión y lenguaje
- **Disponible en Ollama**: ✅ Sí
- **Ventajas**: 
  - Completamente gratis
  - Muy bueno para descripciones detalladas
  - Funciona offline
  - Varios tamaños (7B, 13B, 34B parámetros)
- **Instalación**:
```bash
# Con Ollama
docker exec -it ollama-server ollama pull llava

# O localmente
ollama pull llava
```

#### Uso en N8N:
```javascript
// Nodo HTTP Request
// URL: http://ollama-server:11434/api/generate
// Método: POST
// Body:
{
  "model": "llava",
  "prompt": "Describe esta imagen con detalle para un cliente de servicios automotrices",
  "images": ["<base64_image>"],
  "stream": false
}
```

### 2. **BakLLaVA (Versión mejorada de LLaVA)**
- **Disponible en Ollama**: ✅ Sí
- **Ventajas**: Mejor rendimiento que LLaVA en tareas complejas
```bash
ollama pull bakllava
```

### 3. **MiniGPT-4**
- **GitHub**: https://github.com/Vision-CAIR/MiniGPT-4
- **Descripción**: Capacidades similares a GPT-4V pero open source
- **Ventajas**: Buen balance entre precisión y velocidad

### 4. **BLIP-2 (Bootstrapping Language-Image Pre-training)**
- **Hugging Face**: https://huggingface.co/Salesforce/blip2
- **Ventajas**: Excelente para generación de captions y respuestas visuales
- **Uso**: Via API de Hugging Face (gratis con límites)

---

## 🚀 Configuración Recomendada para Tu Proyecto

### Opción 1: Todo con Ollama (Más Simple)
```yaml
# Agregar a docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama-server
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - app-network
    restart: unless-stopped

volumes:
  ollama_data:
```

**Después instalar modelos**:
```bash
# Transcripción de audio
docker exec -it ollama-server ollama pull whisper

# Análisis de imágenes
docker exec -it ollama-server ollama pull llava

# O el modelo mejorado
docker exec -it ollama-server ollama pull bakllava
```

### Opción 2: APIs Gratuitas (Sin instalación local)

#### Para Audio:
- **Hugging Face Inference API** (gratis con límites)
  - Modelo: `openai/whisper-large-v3`
  - URL: `https://api-inference.huggingface.co/models/openai/whisper-large-v3`
  - Token: Gratis con registro

#### Para Imágenes:
- **Hugging Face Inference API**
  - Modelo: `Salesforce/blip-image-captioning-large`
  - URL: `https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large`

---

## 📊 Comparación de Opciones

| Característica | Ollama (Whisper/LLaVA) | Hugging Face API | OpenAI API |
|----------------|------------------------|------------------|------------|
| **Costo** | Gratis (hardware propio) | Gratis (límites) | Pago por uso |
| **Privacidad** | 100% local | Datos van a HF | Datos van a OpenAI |
| **Configuración** | Media complejidad | Muy fácil | Muy fácil |
| **Precisión Audio** | Excelente | Excelente | Excelente |
| **Precisión Imágenes** | Muy buena | Buena | Excelente |
| **Velocidad** | Depende del hardware | Media | Rápida |
| **Offline** | ✅ Sí | ❌ No | ❌ No |

---

## 🎯 Mi Recomendación para Tu Proyecto

**Para Producción Inmediata:**
- **Audio**: Hugging Face Whisper API (gratis, sin configuración)
- **Imágenes**: Hugging Face BLIP-2 API (gratis, sin configuración)

**Para Producción a Largo Plazo:**
- **Audio**: Whisper en Ollama (gratis, privado, offline)
- **Imágenes**: LLaVA en Ollama (gratis, privado, offline)

---

## 💻 Ejemplo de Integración en N8N

### Nodo para Whisper (Transcripción):
```json
{
  "name": "Transcribir Audio",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://ollama-server:11434/api/generate",
    "sendBody": true,
    "bodyParameters": {
      "model": "whisper",
      "prompt": "={{ $json.audioBase64 }}",
      "stream": false
    }
  }
}
```

### Nodo para LLaVA (Análisis de Imagen):
```json
{
  "name": "Analizar Imagen",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://ollama-server:11434/api/generate",
    "sendBody": true,
    "bodyParameters": {
      "model": "llava",
      "prompt": "Describe esta imagen en detalle. ¿Qué tipo de llave automotriz se muestra?",
      "images": ["={{ $json.imageBase64 }}"],
      "stream": false
    }
  }
}
```

---

## ⚙️ Comandos Útiles

```bash
# Ver modelos instalados en Ollama
docker exec -it ollama-server ollama list

# Probar Whisper
docker exec -it ollama-server ollama run whisper

# Probar LLaVA
docker exec -it ollama-server ollama run llava

# Ver uso de recursos
docker stats ollama-server
```

---

## 📚 Recursos Adicionales

- **Ollama Docs**: https://ollama.ai/library
- **Whisper GitHub**: https://github.com/openai/whisper
- **LLaVA Demo**: https://llava.hliu.cc/
- **Hugging Face**: https://huggingface.co/models
