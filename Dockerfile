FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar servidor
CMD ["npm", "start"]
