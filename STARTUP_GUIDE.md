# Guia de inicio (Windows + Docker)

Este proyecto ya esta configurado para correr con Docker. Sigue estos pasos cada vez que reinicies la maquina o cambie la URL de ngrok.

## 0) Prerequisitos en la laptop

- Docker Desktop instalado y corriendo.
- Git instalado.
- Ngrok instalado y autenticado.
- Skills para agentes instalados (no se versionan en el repo).

Para reinstalar skills locales (ejemplo):

```powershell
npx skills add https://github.com/dammyjay93/interface-design --skill interface-design
```

Si usas otros skills, ejecuta los comandos que usas normalmente para instalarlos.

## Clonar y preparar

```powershell
git clone <URL_DEL_REPO>
cd ADC
copy .env.example .env
```

Luego completa los valores en `.env`.

## 1) Actualizar URL de ngrok (N8N)

Cada vez que cambie tu URL de ngrok, actualiza estas variables en [.env](.env):

- `N8N_HOST`
- `N8N_WEBHOOK_URL`
- `N8N_APPOINTMENT_WEBHOOK`

Ejemplo:

```dotenv
N8N_HOST=tu-subdominio.ngrok-free.app
N8N_WEBHOOK_URL=https://tu-subdominio.ngrok-free.app/webhook/chat
N8N_APPOINTMENT_WEBHOOK=https://tu-subdominio.ngrok-free.app/webhook/appointment
```

## 2) Actualizar webhook en Chatwoot

Cuando cambia ngrok, debes actualizar los webhooks en Chatwoot:

1. Entra a Chatwoot: http://localhost:3001
2. Ve a **Settings -> Webhooks**
3. Actualiza la URL del webhook para que apunte a tu nuevo ngrok

Ejemplo:

```
https://tu-subdominio.ngrok-free.app/webhook/chat
```

## 3) Levantar servicios

En PowerShell, desde `d:\ADC`:

```powershell
docker compose up -d
```

Si Nginx no puede usar el puerto 80, ya esta configurado para usar:

- HTTP: http://localhost:8080
- HTTPS: https://localhost:8443

## 4) Verificar accesos

- Landing: http://localhost:8080
- App directa: http://localhost:3000
- N8N: http://localhost:5678
- Chatwoot: http://localhost:3001

## 5) Chatwoot widget (Nginx)

El widget usa el proxy local por subruta:

- BASE_URL: `http://localhost:8080/chatwoot`
- Archivo: [public/index.html](public/index.html)

Nginx ya tiene el proxy configurado en:

- [nginx/conf.d/default.conf](nginx/conf.d/default.conf)

## 6) Migraciones (solo si las necesitas)

```powershell
docker compose exec app npm run migrate
```

## 7) Diagnostico rapido

Ver logs de Chatwoot:

```powershell
docker compose logs chatwoot --tail 120
```

Ver estado de contenedores:

```powershell
docker compose ps
```

## Notas

- Si el chat no responde, valida que el SDK de Chatwoot cargue:
  - http://localhost:3001/packs/js/sdk.js
- Si ves `ERR_CONNECTION_REFUSED`, revisa que Chatwoot este corriendo y que el proxy de Nginx este activo.

## Recomendaciones de hardware (laptop)

- CPU: 6 cores o mas (Intel i5/i7 o Ryzen 5/7).
- RAM: 16 GB minimo, 32 GB recomendado.
- Almacenamiento: SSD con 30-50 GB libres.
- Sistema: Windows 10/11 con virtualizacion activada.
- Energia: conectado a corriente para rendimiento estable.
