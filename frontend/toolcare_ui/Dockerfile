# Usa uma imagem do Node 22
FROM node:22-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json yarn.lock ./

# Instala as dependências
RUN yarn install

# Copia o código fonte
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para rodar
CMD ["yarn", "start"]