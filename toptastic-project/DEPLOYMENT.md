# 🚀 TopTastic - Guía de Despliegue

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Dominio configurado apuntando a tu servidor
- Puertos 80 y 3001 abiertos en el firewall

## 🐳 Despliegue Rápido

### Opción 1: Script Automático (Linux/macOS)
```bash
chmod +x deploy.sh
./deploy.sh tu-dominio.com
```

### Opción 2: Script Automático (Windows)
```powershell
.\deploy.ps1 tu-dominio.com
```

### Opción 3: Manual
1. Edita `docker-compose.prod.yml`:
   ```yaml
   # Cambiar:
   - FRONTEND_URL=https://tu-dominio.com
   # Y:
   - VITE_API_URL=https://tu-dominio.com:3001/api
   ```

2. Ejecutar:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## 🔧 Configuración del Servidor

### Nginx Reverse Proxy (Recomendado)
Si quieres usar HTTPS y un solo puerto:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoreo

### Ver logs en tiempo real:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Ver estado de servicios:
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Health checks:
- Frontend: `http://tu-dominio.com/health`
- Backend: `http://tu-dominio.com:3001/health`

## 🔄 Comandos Útiles

```bash
# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Parar todo
docker-compose -f docker-compose.prod.yml down

# Actualizar código (rebuild)
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Backup de la base de datos
docker cp $(docker-compose -f docker-compose.prod.yml ps -q backend):/app/database/database.db ./backup-$(date +%Y%m%d).db
```

## 🚨 Solución de Problemas

### Backend no inicia:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Frontend no carga:
1. Verificar que `VITE_API_URL` apunta al dominio correcto
2. Revisar logs del frontend
3. Verificar que nginx está corriendo

### Base de datos se pierde:
- Los datos están en el volumen `database_data`
- Hacer backups regulares con el comando de arriba

### CORS errors:
- Verificar que `FRONTEND_URL` en el backend coincide con tu dominio
- Revisar configuración de CORS en `backend/src/app.js`

## 🔐 Seguridad

### Recomendaciones:
1. **HTTPS**: Usa Let's Encrypt para certificados gratuitos
2. **Firewall**: Solo abre puertos 80, 443, y 22 (SSH)
3. **Updates**: Mantén Docker y el OS actualizados
4. **Backups**: Automatiza backups de la base de datos
5. **Logs**: Configura rotación de logs

### Let's Encrypt (Certbot):
```bash
sudo apt install certbot
sudo certbot --nginx -d tu-dominio.com
```

## 📈 Escalabilidad

Para mayor tráfico, considera:
- Load balancer (nginx upstream)
- Base de datos externa (PostgreSQL)
- CDN para assets estáticos
- Monitoring (Prometheus + Grafana)
- Container orchestration (Kubernetes)
