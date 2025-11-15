const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const EZEE_CREDENTIALS = {
  username: process.env.EZEE_USERNAME || 'j.robles',
  password: process.env.EZEE_PASSWORD || '07102701JP?',
  propertyCode: process.env.EZEE_PROPERTY_CODE || '44018'
};

const EZEE_URLS = {
  login: 'https://live.ipms247.com/login/',
  reservations: 'https://live.ipms247.com/frontoffice/reservations',
  availability: 'https://live.ipms247.com/frontoffice/stayview'
};

let browser = null;
let context = null;

// Inicializar navegador con configuración anti-detección
async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    
    // Crear contexto con configuración realista
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'es-MX',
      timezoneId: 'America/Mexico_City',
      permissions: ['geolocation'],
      geolocation: { latitude: 19.4326, longitude: -99.1332 }, // CDMX
      colorScheme: 'light',
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      javaScriptEnabled: true
    });
    
    // Inyectar scripts anti-detección
    await context.addInitScript(() => {
      // Ocultar webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });
      
      // Simular plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
      
      // Simular idiomas
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-MX', 'es', 'en-US', 'en']
      });
      
      // Chrome runtime
      window.chrome = {
        runtime: {}
      };
      
      // Permisos
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
  }
  
  return context;
}

// Función de scraping con Playwright
async function scrapeEzee(queryType = 'general') {
  const context = await getBrowser();
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navegando a eZee login...');
    
    // Ir a login (igual que Puppeteer)
    await page.goto(EZEE_URLS.login, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('📝 Esperando formulario...');
    
    // Esperar formulario (probar múltiples selectores como Puppeteer)
    try {
      await page.waitForSelector('#username', { timeout: 10000 });
    } catch {
      await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    }
    
    console.log('✍️ Llenando formulario...');
    
    // Llenar formulario usando IDs directos (IGUAL que Puppeteer)
    await page.type('#username', EZEE_CREDENTIALS.username);
    await page.type('#password', EZEE_CREDENTIALS.password);
    await page.type('#hotelcode', EZEE_CREDENTIALS.propertyCode);
    
    console.log('🔐 Haciendo login...');
    
    // Login - hacer click en el botón SIGN IN (IGUAL que Puppeteer)
    await page.click('#login');
    
    // Esperar a que procese el login (sin esperar navegación específica)
    await page.waitForTimeout(3000);
    
    // Verificar login (IGUAL que Puppeteer)
    const currentUrl = page.url();
    console.log('📍 URL actual:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      throw new Error('Login failed - still on login page');
    }
    
    console.log('✅ Login exitoso');
    
    let data = {};
    
    // Extraer reservas (IGUAL que Puppeteer)
    if (queryType === 'reservations' || queryType === 'general') {
      console.log('📋 Extrayendo reservas...');
      await page.goto(EZEE_URLS.reservations, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      const reservations = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(row => {
          const cells = row.querySelectorAll('td');
          return {
            guest: cells[0]?.textContent?.trim() || '',
            checkIn: cells[1]?.textContent?.trim() || '',
            checkOut: cells[2]?.textContent?.trim() || '',
            roomType: cells[3]?.textContent?.trim() || '',
            nights: cells[4]?.textContent?.trim() || '',
            total: cells[5]?.textContent?.trim() || '',
            balance: cells[6]?.textContent?.trim() || '',
            status: cells[7]?.textContent?.trim() || ''
          };
        });
      });
      
      data.reservations = reservations;
      console.log(`✅ ${reservations.length} reservas extraídas`);
    }
    
    // Extraer disponibilidad (IGUAL que Puppeteer)
    if (queryType === 'availability' || queryType === 'general') {
      console.log('🏨 Extrayendo disponibilidad...');
      await page.goto(EZEE_URLS.availability, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      const availability = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(row => {
          const cells = row.querySelectorAll('td');
          return {
            date: cells[0]?.textContent?.trim() || '',
            roomType: cells[1]?.textContent?.trim() || '',
            available: cells[2]?.textContent?.trim() || '',
            occupied: cells[3]?.textContent?.trim() || '',
            price: cells[4]?.textContent?.trim() || '',
            occupancy: cells[5]?.textContent?.trim() || ''
          };
        });
      });
      
      data.availability = availability;
      console.log(`✅ ${availability.length} tipos de habitación extraídos`);
    }
    
    await page.close();
    
    return {
      success: true,
      type: queryType,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'playwright-stealth'
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.close();
    throw error;
  }
}

// Endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    engine: 'playwright-stealth',
    timestamp: new Date().toISOString() 
  });
});

app.post('/scrape', async (req, res) => {
  try {
    const { type = 'general' } = req.body;
    console.log(`\n🚀 Nueva solicitud de scraping: ${type}`);
    const result = await scrapeEzee(type);
    res.json(result);
  } catch (error) {
    console.error('❌ Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🎭 Playwright Stealth Server`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Scrape: POST http://localhost:${PORT}/scrape`);
  console.log(`\n✨ Anti-detection features enabled\n`);
});

// Cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando navegador...');
  if (browser) {
    await browser.close();
  }
  process.exit();
});
