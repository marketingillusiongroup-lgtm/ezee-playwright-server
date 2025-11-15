FROM mcr.microsoft.com/playwright:v1.56.1-focal

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Instalar navegadores de Playwright
RUN npx playwright install chromium

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar servidor
CMD ["npm", "start"]
