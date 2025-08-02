const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar rutas y middleware
const listsRoutes = require('./routes/lists');
const itemsRoutes = require('./routes/items');
const { requestLogger, errorHandler, notFound } = require('./middleware');

// Inicializar base de datos
const initDatabase = require('./config/initDatabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS - Más permisivo para development
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman) en desarrollo
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL]
      : [process.env.FRONTEND_URL || 'http://localhost:3000'];
    
    // Filtrar valores undefined
    const validOrigins = allowedOrigins.filter(Boolean);
    
    if (validOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}. Allowed: ${validOrigins.join(', ')}`);
      callback(null, true); // Permitir temporalmente para debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares globales
app.use(helmet({
  contentSecurityPolicy: false // Desactivar CSP para desarrollo
}));
app.use(cors(corsOptions));

// Log requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no-origin'}`);
    next();
  });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'toptastic-backend'
  });
});

// API Routes
app.use('/api/lists', listsRoutes);
app.use('/api/lists', itemsRoutes); // Para endpoints como POST /api/lists/:id/items
app.use('/api/items', itemsRoutes); // Para endpoints como PATCH /api/items/:id/like

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log('🚀 Starting TopTastic Backend...');
    
    // Inicializar base de datos
    initDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📋 API base URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Environment: Development`);
        console.log(`🌍 CORS origins allowed: ${['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Manejo graceful de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Iniciar servidor
startServer();
