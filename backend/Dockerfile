# Usa uma imagem leve do Python 3.13
FROM python:3.13-slim

# Instala dependências do sistema necessárias para o Postgres
RUN apt-get update && apt-get install -y libpq-dev gcc

# Define a pasta de trabalho dentro da caixa
WORKDIR /app

# Instala o Poetry
RUN pip install poetry

# Copia os arquivos de configuração de dependências
COPY pyproject.toml poetry.lock ./

# Configura o poetry para não criar virtualenv (pois o Docker já é isolado) e instala
RUN poetry config virtualenvs.create false && poetry install --no-root

# Copia todo o resto do código para dentro da caixa
COPY . .

# Comando para rodar o servidor quando a caixa abrir
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]