# Usa Python 3.12 como base
FROM python:3.12

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Instala Poetry globalmente
RUN pip install --no-cache-dir poetry

# Copia los archivos de Poetry desde la carpeta raíz del proyecto
COPY ../pyproject.toml ../poetry.lock /app/

# Instala dependencias sin crear un entorno virtual
RUN poetry config virtualenvs.create false && poetry install --no-root --no-interaction --no-ansi

# Copia el código del microservicio al contenedor
COPY auth_service /app

# Expone el puerto del microservicio
EXPOSE 5000

# Ejecuta el microservicio con Poetry
CMD ["poetry", "run", "python", "run.py"]
