# 🚀 TopTastic - Script de Despliegue para Windows
# Usar: .\deploy.ps1 tu-dominio.com

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

Write-Host "🚀 TopTastic - Desplegando en producción..." -ForegroundColor Blue

Write-Host "🌐 Configurando para dominio: $Domain" -ForegroundColor Yellow

# Crear copia del docker-compose para producción
Copy-Item docker-compose.prod.yml docker-compose.prod.tmp.yml

# Reemplazar dominio en el archivo temporal
(Get-Content docker-compose.prod.tmp.yml) -replace 'tu-dominio\.com', $Domain | Set-Content docker-compose.prod.tmp.yml

Write-Host "📦 Construyendo contenedores..." -ForegroundColor Blue

# Parar servicios existentes
docker-compose -f docker-compose.prod.tmp.yml down --remove-orphans

# Construir y levantar servicios
docker-compose -f docker-compose.prod.tmp.yml build --no-cache
docker-compose -f docker-compose.prod.tmp.yml up -d

# Limpiar archivo temporal
Remove-Item docker-compose.prod.tmp.yml

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "📍 Frontend: http://$Domain" -ForegroundColor Blue
Write-Host "📍 Backend: http://$Domain`:3001" -ForegroundColor Blue
Write-Host "📍 Health: http://$Domain`:3001/health" -ForegroundColor Blue

Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "Parar servicios: docker-compose -f docker-compose.prod.yml down"
Write-Host "Reiniciar: docker-compose -f docker-compose.prod.yml restart"

# Verificar que los servicios están corriendo
Write-Host "🔍 Verificando servicios..." -ForegroundColor Blue
Start-Sleep 5

$services = docker-compose -f docker-compose.prod.yml ps
if ($services -match "Up") {
    Write-Host "✅ Servicios corriendo correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Algunos servicios pueden tener problemas" -ForegroundColor Red
    Write-Host "Revisa los logs: docker-compose -f docker-compose.prod.yml logs"
}
