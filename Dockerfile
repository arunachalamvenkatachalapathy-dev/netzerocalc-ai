FROM node:22-alpine AS frontend
WORKDIR /web
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY --from=frontend /web/dist ./backend/static
EXPOSE 8080
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
