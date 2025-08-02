# 🎯 TopTastic

**TopTastic** es una aplicación web que permite crear listas colaborativas de forma rápida y sin necesidad de registrarse. Perfecto para que grupos de amigos creen "tops" o listas divertidas como "Las peores excusas" o "Las mejores películas de los 90".

## ✨ Características

- **🚀 Creación Anónima**: Cualquier visitante puede crear una nueva lista
- **🔗 Compartir por Link**: Al crear una lista, se genera una URL única y permanente
- **👥 Colaboración**: Múltiples usuarios pueden añadir elementos a la misma lista
- **🎨 Items Personalizables**: Define campos custom para cada tipo de lista
- **👍 Sistema de Votación**: Cada ítem tiene un contador de "likes"
- **📊 Ordenación**: Los items se ordenan automáticamente por popularidad

## 🏗️ Arquitectura

### Backend
- **Node.js** con Express.js
- **SQLite** como base de datos (archivo local)
- **API RESTful** para todas las operaciones
- **CORS** configurado para desarrollo y producción

### Frontend
- **React** con JavaScript (sin TypeScript)
- **Vite** como bundler y dev server
- **React Router** para navegación
- **Pico.css** para estilos minimalistas
- **Fetch API** para comunicación con backend

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd toptastic-project
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno**
```bash
# Backend
cd ../backend
cp .env.example .env

# Frontend  
cd ../frontend
cp .env.example .env
```

5. **Ejecutar en modo desarrollo**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/health

## 🐳 Docker

### Desarrollo con Docker
```bash
docker-compose up --build
```

### Producción con Docker
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📡 API Endpoints

### Listas
- `POST /api/lists` - Crear nueva lista
- `GET /api/lists/:id` - Obtener lista con sus items

### Items
- `POST /api/lists/:id/items` - Añadir item a una lista
- `PATCH /api/items/:itemId/like` - Incrementar likes de un item
- `PUT /api/lists/:listId/items/reorder` - Reordenar items

### Ejemplo de Uso

**Crear una lista:**
```javascript
POST /api/lists
{
  "title": "Las peores excusas",
  "description": "Lista colaborativa de excusas ridículas",
  "templateFields": [
    {
      "name": "excuse_text",
      "label": "Excusa", 
      "type": "text",
      "required": true
    },
    {
      "name": "who_said_it",
      "label": "Quién la dijo",
      "type": "text", 
      "required": false
    }
  ]
}
```

**Añadir un item:**
```javascript
POST /api/lists/{listId}/items
{
  "content": {
    "excuse_text": "Se me olvidó en casa",
    "who_said_it": "Ana"
  }
}
```

## 🗃️ Modelo de Datos

### Lists Table
```sql
id (TEXT PRIMARY KEY)           -- UUID v4
title (TEXT NOT NULL)          -- Título de la lista
description (TEXT)             -- Descripción opcional
template_fields (TEXT)         -- JSON con estructura de campos
created_at (DATETIME)          -- Timestamp de creación
```

### Items Table
```sql
id (TEXT PRIMARY KEY)          -- UUID v4
list_id (TEXT FOREIGN KEY)     -- ID de la lista padre
content (TEXT)                 -- JSON con valores según template
likes_count (INTEGER)          -- Contador de likes
position (INTEGER)             -- Posición para ordenamiento manual
created_at (DATETIME)          -- Timestamp de creación
```

## 🔧 Scripts Disponibles

### Backend
- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm run init-db` - Inicializar base de datos

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

## 🌍 Despliegue

### Variables de Entorno para Producción

**Backend (.env):**
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=./database/database.db
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env):**
```
VITE_API_URL=https://your-domain.com:3001/api
```

### Con Docker en Servidor

1. Subir código al servidor
2. Configurar variables de entorno en `docker-compose.prod.yml`
3. Ejecutar:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollo

- Backend: Node.js + Express + SQLite
- Frontend: React + Vite + Pico.css
- Containerización: Docker + Docker Compose
- Base de datos: SQLite (archivo local)

---

¡Disfruta creando listas colaborativas con TopTastic! 🎉
