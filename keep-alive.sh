#!/bin/bash

# Script para mantener la aplicación Salud al Paso activa
# Este script asegura que todos los servicios se mantengan corriendo

echo "🏥 Iniciando Salud al Paso - UNAN Health App"
echo "Manteniendo servicios activos..."

# Función para verificar y reiniciar servicios si es necesario
check_and_restart_services() {
    echo "🔍 Verificando estado de servicios..."
    
    # Verificar MongoDB
    if ! supervisorctl status mongodb | grep -q "RUNNING"; then
        echo "⚠️  MongoDB no está corriendo, reiniciando..."
        supervisorctl restart mongodb
    fi
    
    # Verificar Backend
    if ! supervisorctl status backend | grep -q "RUNNING"; then
        echo "⚠️  Backend no está corriendo, reiniciando..."
        supervisorctl restart backend
    fi
    
    # Verificar Expo
    if ! supervisorctl status expo | grep -q "RUNNING"; then
        echo "⚠️  Expo no está corriendo, reiniciando..."
        supervisorctl restart expo
    fi
    
    echo "✅ Verificación de servicios completada"
}

# Bucle infinito para mantener los servicios activos
while true; do
    check_and_restart_services
    
    # Mostrar estado actual
    echo "📊 Estado actual de servicios:"
    supervisorctl status | grep -E "(mongodb|backend|expo)"
    
    echo "🌐 App accesible en: https://5bfb51ce-b3a2-4719-933c-a3f2613d17f9.preview.emergentagent.com"
    echo "📱 Para acceso móvil: Abre el enlace en tu navegador móvil"
    echo "---"
    
    # Esperar 5 minutos antes de la siguiente verificación
    sleep 300
done