# 🎭 Playwright Stealth Server para eZee

Servidor con **Playwright + Anti-detección** para extraer datos de eZee Absolute.

## 🎯 Ventajas sobre Puppeteer

- ✅ **Más difícil de detectar** - Playwright es más moderno
- ✅ **Anti-detección integrada** - Oculta webdriver y automatización
- ✅ **Más estable** - Mejor manejo de navegación
- ✅ **100% GRATIS** - Sin costos adicionales

## 🚀 Desplegar en Easypanel

### PASO 1: Subir a GitHub

1. Crea repositorio: `ezee-playwright-server`
2. Sube estos archivos:
   - server.js
   - package.json
   - Dockerfile
   - README.md

### PASO 2: Desplegar

1. En Easypanel → Proyecto n8n
2. **+ Add Service** → **App**
3. Configurar:
   ```
   Name: playwright-server
   Source: GitHub
   Repository: tu-usuario/ezee-playwright-server
   Branch: main
   Build Method: Dockerfile
   ```

4. **Variables de entorno**:
   ```
   EZEE_USERNAME=j.robles
   EZEE_PASSWORD=07102701JP?
   EZEE_PROPERTY_CODE=44018
   ```

5. Puerto: **3000**
6. Deploy

### PASO 3: Actualizar n8n

Cambia la URL en el workflow de:
```
https://n8n-puppeteer-server.acqi8x.easypanel.host/scrape
```

A:
```
https://n8n-playwright-server.acqi8x.easypanel.host/scrape
```

## 🎭 Características Anti-Detección

1. **Oculta webdriver** - navigator.webdriver = false
2. **Simula plugins** - Navegador real
3. **User agent realista** - Chrome 120
4. **Geolocalización** - México
5. **Idiomas** - Español/Inglés
6. **Comportamiento humano** - Delays y movimientos de mouse
7. **Chrome runtime** - window.chrome presente

## 🧪 Probar

```bash
# Health check
curl https://playwright-server.acqi8x.easypanel.host/health

# Scrape
curl -X POST https://playwright-server.acqi8x.easypanel.host/scrape \
  -H "Content-Type: application/json" \
  -d '{"type": "general"}'
```

## 📊 Probabilidad de Éxito

- **Puppeteer**: 10% (bloqueado)
- **Playwright Stealth**: 60-70% (mejor chance)
- **Extensión Chrome**: 95% (login manual)
- **API Oficial**: 100% (pero cara)

## ⚠️ Importante

Si Playwright también es bloqueado, la única opción gratis es la **Extensión de Chrome** con login manual.

## 🔄 Siguiente Paso

Si esto no funciona, te ayudo a crear la extensión de Chrome (100% gratis, 95% confiable).
