# ✅ Estado del Sistema - Workflow Completo

## 📊 Resumen de Contenedores Activos

```
✅ n8n-workflow-postgres  - PostgreSQL para memoria de conversaciones
✅ n8n-workflow-redis     - Redis para gestión de mensajes en tiempo real
✅ automotive-keys-n8n    - N8N para workflows
✅ chatwoot               - Sistema de chat
✅ chatwoot-sidekiq       - Worker de Chatwoot
✅ chatwoot-postgres      - Base de datos de Chatwoot
✅ chatwoot-redis         - Redis de Chatwoot
✅ automotive-keys-db     - PostgreSQL principal del proyecto
✅ automotive-keys-redis  - Redis principal del proyecto
✅ automotive-keys-app    - Aplicación Node.js
✅ ollama-server          - Servidor de modelos IA
```

## 🗄️ Base de Datos PostgreSQL N8N (n8n-workflow-postgres)

### Conexión:
- **Host**: `n8n-postgres` (dentro de Docker) o `localhost:5432` (externo)
- **Puerto**: 5432
- **Base de datos**: `n8n_workflow`
- **Usuario**: `n8n_user`
- **Password**: `N8nWorkflow2026!Secure`

### Tabla Creada: `n8n_chat_histories`

**Estructura:**
```sql
id          SERIAL PRIMARY KEY
session_id  VARCHAR(255) NOT NULL    -- Teléfono o email del usuario
message     JSONB NOT NULL            -- Mensaje en formato JSON
created_at  TIMESTAMP                 -- Fecha de creación
updated_at  TIMESTAMP                 -- Última actualización
```

**Índices:**
- `idx_n8n_chat_histories_session_id` - Para búsquedas rápidas por usuario
- `idx_n8n_chat_histories_created_at` - Para ordenar por fecha

### ✅ Prueba Exitosa:
- Se insertaron 4 mensajes de prueba
- Se consultaron conversaciones por usuario
- Los índices están funcionando correctamente

---

## 🔴 Redis N8N (n8n-workflow-redis)

### Conexión:
- **Host**: `n8n-redis` (dentro de Docker)
- **Puerto**: 6379
- **Database**: 0

### Uso:
Redis almacena temporalmente los mensajes del usuario durante 30 segundos antes de procesarlos.

**Estructura de datos:**
```
LISTA: {telefono_usuario}
VALORES: ["mensaje1", "mensaje2", "mensaje3"]
```

### ✅ Prueba Exitosa:
- PING → PONG (conexión OK)
- Guardados 3 mensajes de prueba
- Recuperados correctamente

---

## 🤖 Modelos IA en Ollama

### Modelos Instalados:

| Modelo | Tamaño | Uso |
|--------|--------|-----|
| **whisper-tiny** | 44 MB | Transcripción de audio (ligero y rápido) |
| **llava** | 4.7 GB | Análisis y descripción de imágenes |
| **llama3** | 4.7 GB | AI Agent principal (conversaciones) |
| **nomic-embed-text** | 274 MB | Embeddings para búsquedas semánticas |

### URLs de Conexión (desde N8N):
- **Whisper**: `http://ollama-server:11434/api/generate` (modelo: `dimavz/whisper-tiny`)
- **LLaVA**: `http://ollama-server:11434/api/generate` (modelo: `llava`)
- **Llama3**: `http://ollama-server:11434/api/generate` (modelo: `llama3`)

---

## 🔧 Comandos Útiles

### PostgreSQL

```powershell
# Conectar a la base de datos
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow

# Ver todas las tablas
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "\dt"

# Ver estructura de tabla
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "\d n8n_chat_histories"

# Consultar últimos mensajes
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "SELECT session_id, message->>'type', message->>'content', created_at FROM n8n_chat_histories ORDER BY created_at DESC LIMIT 10;"

# Limpiar tabla (CUIDADO: borra todos los datos)
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "TRUNCATE TABLE n8n_chat_histories;"
```

### Redis

```powershell
# Conectar a Redis
docker exec -it n8n-workflow-redis redis-cli

# Probar conexión
docker exec -it n8n-workflow-redis redis-cli PING

# Ver todas las claves
docker exec -it n8n-workflow-redis redis-cli KEYS "*"

# Ver mensajes de un usuario
docker exec -it n8n-workflow-redis redis-cli LRANGE "+5215512345678" 0 -1

# Borrar una lista
docker exec -it n8n-workflow-redis redis-cli DEL "test-usuario"

# Limpiar toda la base de datos (CUIDADO)
docker exec -it n8n-workflow-redis redis-cli FLUSHALL
```

### Ollama

```powershell
# Ver modelos instalados
docker exec -it ollama-server ollama list

# Probar Whisper (transcripción)
docker exec -it ollama-server ollama run dimavz/whisper-tiny

# Probar LLaVA (imágenes)
docker exec -it ollama-server ollama run llava

# Probar Llama3 (chat)
docker exec -it ollama-server ollama run llama3

# Ver logs
docker logs ollama-server
```

---

## 📝 Próximos Pasos

### 1. Configurar Credenciales en N8N

Abre N8N: http://localhost:5678

**Credencial Redis:**
```
Name: N8N Workflow Redis
Host: n8n-redis
Port: 6379
Database: 0
```

**Credencial PostgreSQL:**
```
Name: N8N Workflow Postgres
Host: n8n-postgres
Port: 5432
Database: n8n_workflow
User: n8n_user
Password: N8nWorkflow2026!Secure
SSL: Disable
```

### 2. Importar Workflow

1. Ve a N8N → "New workflow" → "Import from file"
2. Selecciona: `n8n-workflows/automotive-keys-workflow-adaptado.json`
3. Configura las credenciales de Redis y PostgreSQL en cada nodo
4. Actualiza el campo `api_key_chatwoot` en el nodo "Datos" con tu API key real
5. Guarda y activa el workflow

### 3. Configurar Nodos de IA

**Para Audio (Whisper):**
- Reemplaza el nodo placeholder con HTTP Request
- URL: `http://ollama-server:11434/api/generate`
- Body: 
```json
{
  "model": "dimavz/whisper-tiny",
  "prompt": "{{ $json.data_url }}",
  "stream": false
}
```

**Para Imágenes (LLaVA):**
- Reemplaza el nodo placeholder con HTTP Request
- URL: `http://ollama-server:11434/api/generate`
- Body:
```json
{
  "model": "llava",
  "prompt": "Describe esta imagen en detalle",
  "images": ["{{ $json.data_url }}"],
  "stream": false
}
```

---

## 🎯 Verificación Final

Ejecuta estos comandos para confirmar que todo está bien:

```powershell
# 1. Ver todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}"

# 2. Probar PostgreSQL
docker exec -it n8n-workflow-postgres psql -U n8n_user -d n8n_workflow -c "SELECT COUNT(*) FROM n8n_chat_histories;"

# 3. Probar Redis
docker exec -it n8n-workflow-redis redis-cli PING

# 4. Probar Ollama
docker exec -it ollama-server ollama list
```

**Todo debería responder correctamente** ✅

---

## 📚 Archivos de Referencia

- [docker-compose.yml](docker-compose.yml) - Configuración de todos los contenedores
- [.env](.env) - Variables de entorno (incluye N8N_DB_PASSWORD)
- [migrations/n8n-init.sql](migrations/n8n-init.sql) - Script de creación de tabla
- [test-databases.sql](test-databases.sql) - Script de pruebas ejecutado exitosamente
- [n8n-workflows/automotive-keys-workflow-adaptado.json](n8n-workflows/automotive-keys-workflow-adaptado.json) - Workflow listo para importar
- [GUIA_WORKFLOW_COMPLETO.md](GUIA_WORKFLOW_COMPLETO.md) - Guía paso a paso completa
- [ALTERNATIVAS_IA_OPENSOURCE.md](ALTERNATIVAS_IA_OPENSOURCE.md) - Guía de modelos IA

---

## ✅ Estado Actual: LISTO PARA USAR

Todos los componentes están configurados y funcionando:
- ✅ Contenedores levantados
- ✅ Base de datos creada con tabla n8n_chat_histories
- ✅ Redis funcionando correctamente
- ✅ Modelos IA instalados (whisper-tiny, llava, llama3)
- ✅ Pruebas exitosas de PostgreSQL y Redis

**Siguiente paso**: Importar el workflow en N8N y configurar las credenciales.
