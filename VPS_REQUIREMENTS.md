# 📋 Requisitos de VPS para Landing Page con Chat AI

## 🖥️ Especificaciones Mínimas Recomendadas

### Opción 1: Configuración Básica (Todo en un servidor)
**Ideal para arrancar y tráfico bajo-medio (hasta 1000 visitas/día)**

```
CPU: 2 vCPU cores
RAM: 4 GB
Almacenamiento: 50 GB SSD
Ancho de banda: 2 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

**Costo estimado**: $10-20/mes
**Proveedores recomendados**:
- DigitalOcean Droplet ($12/mes)
- Linode Shared CPU ($12/mes)
- Vultr Cloud Compute ($12/mes)
- Hetzner Cloud CX21 (€5.83/mes)

---

### Opción 2: Configuración Profesional (Tráfico medio-alto)
**Para tráfico medio-alto (1000-5000 visitas/día)**

```
CPU: 4 vCPU cores
RAM: 8 GB
Almacenamiento: 100 GB SSD
Ancho de banda: 5 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

**Costo estimado**: $40-60/mes
**Proveedores recomendados**:
- DigitalOcean ($48/mes)
- Linode ($48/mes)
- AWS EC2 t3.large (~$60/mes)

---

### Opción 3: Configuración Empresarial (Alto tráfico)
**Para alto tráfico (5000+ visitas/día) con múltiples servidores**

#### Servidor Principal (Aplicación)
```
CPU: 4 vCPU cores
RAM: 8 GB
Almacenamiento: 100 GB SSD
```

#### Servidor de Base de Datos
```
CPU: 2 vCPU cores
RAM: 4 GB
Almacenamiento: 100 GB SSD (con backups)
```

#### Servidor N8N/Chatwoot
```
CPU: 2 vCPU cores
RAM: 4 GB
Almacenamiento: 50 GB SSD
```

**Costo estimado total**: $80-120/mes

---

## 📦 Software Necesario en el VPS

### 1. Sistema Base
```bash
- Ubuntu 22.04 LTS (recomendado)
- Firewall (ufw)
- Fail2ban (seguridad)
```

### 2. Runtime & Servicios
```bash
- Node.js 18.x o superior
- npm o yarn
- PM2 (gestor de procesos)
- Nginx (reverse proxy)
- PostgreSQL 14 o superior
- Redis (caché y sesiones) - Opcional
```

### 3. N8N
```bash
- N8N (self-hosted)
- Docker (opcional, para N8N)
- Docker Compose (opcional)
```

### 4. Chatwoot
```bash
- Chatwoot (self-hosted)
- Redis (requerido para Chatwoot)
- PostgreSQL (puede compartir con la app)
```

### 5. Certificados SSL
```bash
- Certbot (Let's Encrypt)
- SSL/TLS certificates
```

---

## 🔧 Instalación Completa en VPS

### Script de instalación automática

```bash
#!/bin/bash

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2
sudo npm install -g pm2

# Instalar Redis
sudo apt install -y redis-server

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Instalación base completada"
```

---

## 🐳 Instalación con Docker (Alternativa)

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Aplicación principal
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    restart: always

  # PostgreSQL
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: automotive_keys
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  # Redis
  redis:
    image: redis:7-alpine
    restart: always

  # N8N
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}
    volumes:
      - n8n_data:/home/node/.n8n
    restart: always

  # Chatwoot
  chatwoot:
    image: chatwoot/chatwoot:latest
    ports:
      - "3001:3000"
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DATABASE=chatwoot_production
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY_BASE=${CHATWOOT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: always

  # Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - n8n
      - chatwoot
    restart: always

volumes:
  postgres_data:
  n8n_data:
```

---

## ⚙️ Configuración de Nginx

### /etc/nginx/sites-available/automotive-keys

```nginx
# Landing Page
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# N8N
server {
    listen 80;
    server_name n8n.tudominio.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Chatwoot
server {
    listen 80;
    server_name chat.tudominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Configuración SSL

```bash
# Instalar certificados para todos los dominios
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
sudo certbot --nginx -d n8n.tudominio.com
sudo certbot --nginx -d chat.tudominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

---

## 📊 Monitoreo y Mantenimiento

### PM2 Setup

```bash
# Iniciar aplicación
pm2 start server.js --name automotive-keys

# Configurar auto-inicio
pm2 startup
pm2 save

# Monitorear
pm2 monit
pm2 logs
```

### Backups Automáticos

```bash
# Script de backup (guardar en /root/backup.sh)
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U postgres automotive_keys > $BACKUP_DIR/db.sql

# Backup archivos
tar -czf $BACKUP_DIR/files.tar.gz /var/www/automotive-keys

# Limpiar backups antiguos (más de 30 días)
find /backups -type d -mtime +30 -exec rm -rf {} \;

# Crontab: 0 2 * * * /root/backup.sh
```

---

## 💰 Resumen de Costos Mensuales

### Configuración Básica (Todo en uno)
```
VPS: $12-20/mes
Dominio: $10-15/año
SSL: Gratis (Let's Encrypt)
Total: ~$15-25/mes
```

### Configuración Profesional
```
VPS Principal: $40-60/mes
Dominio: $10-15/año
CDN (Cloudflare): Gratis
Backups: $5-10/mes
Monitoring: $0-20/mes
Total: ~$50-90/mes
```

### Configuración Empresarial (Multi-servidor)
```
VPS App: $40-60/mes
VPS Database: $20-30/mes
VPS N8N/Chatwoot: $20-30/mes
Load Balancer: $10-20/mes
Backups: $10-20/mes
CDN Pro: $20-50/mes
Total: ~$120-210/mes
```

---

## 🎯 Recomendación Final

Para empezar, recomiendo:

**Opción 1: VPS Único (Más económico)**
- Hetzner Cloud CX21 (€5.83/mes) o DigitalOcean ($12/mes)
- 2 vCPU, 4GB RAM, 40GB SSD
- Instalar todo en un servidor
- Configurar backups automáticos
- Usar Cloudflare como CDN (gratis)

**Cuando crezcas (>1000 visitas/día):**
- Upgrade a 4 vCPU, 8GB RAM
- Separar base de datos a servidor dedicado
- Implementar Redis para caché
- Considerar múltiples servidores con load balancer

**Proveedores recomendados en orden de costo/beneficio:**
1. Hetzner Cloud (mejor precio/rendimiento)
2. DigitalOcean (excelente UX y docs)
3. Linode (buen balance)
4. Vultr (buena red global)
5. AWS/Azure (si necesitas escalabilidad extrema)
