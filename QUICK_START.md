# 🚀 Guía de Despliegue Rápido

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
cd d:\ADC
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env con tus datos
notepad .env
```

**Variables mínimas necesarias:**
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=automotive_keys
DB_USER=postgres
DB_PASSWORD=tu_password

N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat
N8N_APPOINTMENT_WEBHOOK=http://localhost:5678/webhook/appointment
```

### 3. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Ejecutar:
CREATE DATABASE automotive_keys;
\q
```

### 4. Ejecutar Migraciones

```bash
npm run migrate
```

### 5. Iniciar Aplicación

```bash
# Modo desarrollo
npm run dev

# O modo producción
npm start
```

### 6. Acceder a la Aplicación

```
http://localhost:3000
```

---

## 🎨 Personalización

### Cambiar Colores

Editar [public/css/style.css](public/css/style.css):

```css
:root {
    --primary-color: #1e40af;      /* Color principal */
    --secondary-color: #f59e0b;    /* Color secundario */
    --dark-color: #1f2937;         /* Color oscuro */
}
```

### Actualizar Logo

Reemplazar el archivo `Logo y estilo.png` con tu logo real.

### Modificar Información de Contacto

Editar [public/index.html](public/index.html):

```html
<!-- Buscar sección de contacto y actualizar -->
<a href="tel:+1234567890">+1 (234) 567-890</a>
<a href="mailto:info@ejemplo.com">info@ejemplo.com</a>
```

### Cambiar Número de WhatsApp

En [public/js/main.js](public/js/main.js):

```javascript
function openWhatsApp() {
    const phone = '1234567890'; // TU NÚMERO AQUÍ (sin + ni espacios)
    // ...
}
```

---

## 📝 Lista de Verificación Pre-Lanzamiento

- [ ] Logo actualizado
- [ ] Información de contacto correcta
- [ ] Número de WhatsApp configurado
- [ ] Colores personalizados
- [ ] Servicios y precios actualizados
- [ ] Testimonios reales
- [ ] Marcas que atiendes
- [ ] N8N configurado y probado
- [ ] Base de datos creada y migrada
- [ ] Certificado SSL instalado
- [ ] Dominio apuntando al VPS
- [ ] Backups configurados

---

## 🔧 Comandos Útiles

```bash
# Ver logs de la aplicación
pm2 logs automotive-keys

# Reiniciar aplicación
pm2 restart automotive-keys

# Ver estado
pm2 status

# Detener aplicación
pm2 stop automotive-keys

# Ver errores de base de datos
sudo -u postgres psql automotive_keys
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 10;
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa [README.md](README.md)
2. Consulta [VPS_REQUIREMENTS.md](VPS_REQUIREMENTS.md)
3. Lee [N8N_CHATWOOT_INTEGRATION.md](N8N_CHATWOOT_INTEGRATION.md)

---

## ✅ Próximos Pasos

1. **Instalar en VPS** - Ver [VPS_REQUIREMENTS.md](VPS_REQUIREMENTS.md)
2. **Configurar N8N** - Ver [N8N_CHATWOOT_INTEGRATION.md](N8N_CHATWOOT_INTEGRATION.md)
3. **Configurar Chatwoot** - Ver sección de Chatwoot en integración
4. **Conectar WhatsApp** - Seguir guía de WhatsApp
5. **Probar todo el flujo** - Hacer pruebas completas
6. **Lanzar** - ¡Empezar a recibir clientes!
