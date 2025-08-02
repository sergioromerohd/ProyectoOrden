#!/bin/bash

# 🚀 TopTastic - Script de Despliegue
# Usar: ./deploy.sh tu-dominio.com

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TopTastic - Desplegando en producción...${NC}"

# Verificar que se pasó un dominio
if [ "$#" -ne 1 ]; then
    echo -e "${RED}❌ Error: Debes proporcionar tu dominio${NC}"
    echo "Uso: ./deploy.sh tu-dominio.com"
    exit 1
fi

DOMAIN=$1
echo -e "${YELLOW}🌐 Configurando para dominio: ${DOMAIN}${NC}"

# Crear copia del docker-compose para producción
cp docker-compose.prod.yml docker-compose.prod.tmp.yml

# Reemplazar dominio en el archivo temporal
sed -i "s/tu-dominio\.com/${DOMAIN}/g" docker-compose.prod.tmp.yml

echo -e "${BLUE}📦 Construyendo contenedores...${NC}"

# Construir y levantar servicios
docker-compose -f docker-compose.prod.tmp.yml down --remove-orphans
docker-compose -f docker-compose.prod.tmp.yml build --no-cache
docker-compose -f docker-compose.prod.tmp.yml up -d

# Limpiar archivo temporal
rm docker-compose.prod.tmp.yml

echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo -e "${BLUE}📍 Frontend: http://${DOMAIN}${NC}"
echo -e "${BLUE}📍 Backend: http://${DOMAIN}:3001${NC}"
echo -e "${BLUE}📍 Health: http://${DOMAIN}:3001/health${NC}"

echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo "Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "Parar servicios: docker-compose -f docker-compose.prod.yml down"
echo "Reiniciar: docker-compose -f docker-compose.prod.yml restart"

# Verificar que los servicios están corriendo
echo -e "${BLUE}🔍 Verificando servicios...${NC}"
sleep 5

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Servicios corriendo correctamente${NC}"
else
    echo -e "${RED}❌ Algunos servicios pueden tener problemas${NC}"
    echo "Revisa los logs: docker-compose -f docker-compose.prod.yml logs"
fi
