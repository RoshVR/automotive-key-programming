# Configurar Webhook con ngrok

## Opción A: Usando ngrok (Túnel público temporal)

### 1. Descargar ngrok
```powershell
# Descarga desde: https://ngrok.com/download
# O usa chocolatey:
choco install ngrok
```

### 2. Crear túnel para N8N
```powershell
ngrok http 5678
```

### 3. Usar la URL pública
ngrok te dará una URL como: `https://abc123.ngrok.io`

En Chatwoot, usa:
```
https://abc123.ngrok.io/webhook/chatwoot-webhook
```

⚠️ **Nota:** La URL de ngrok cambia cada vez que reinicias (en la versión gratuita)

---

## Opción B: Modificar validación de Chatwoot (Ya aplicado)

Ya agregué las variables de entorno para permitir URLs locales.

Ahora puedes usar cualquiera de estas URLs en el webhook:
- `http://172.18.0.2:5678/webhook/chatwoot-webhook` (IP del contenedor)
- `http://localhost:5678/webhook/chatwoot-webhook` (Localhost)
- `http://automotive-keys-n8n:5678/webhook/chatwoot-webhook` (Nombre del contenedor)

---

## Opción C: Usar IP local de tu máquina

Si estás en la misma red:
```
http://172.29.96.1:5678/webhook/chatwoot-webhook
```

Pero necesitas que N8N escuche en todas las interfaces (0.0.0.0), no solo localhost.
