# RICE Prioritization app

Aplicación mínima en Node.js + Express + SQLite para guardar ideas usando el marco RICE (Reach, Impact, Confidence, Effort) y obtener su puntaje.

## Requisitos
- Node.js 18+
- npm

## Instalación
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor (por defecto en http://localhost:3000):
   ```bash
   npm run dev
   ```

La base de datos se crea automáticamente como `data.db` en la raíz del proyecto.

## Uso
- **Interfaz web**: abre http://localhost:3000 para cargar el formulario y la tabla de ideas.
- **API**:
  - `GET /api/ideas` devuelve todas las ideas ordenadas por fecha de creación.
  - `POST /api/ideas` crea una idea. Ejemplo:
    ```bash
    curl -X POST http://localhost:3000/api/ideas \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Nueva campaña",
        "reach": 1000,
        "impact": 3,
        "confidence": 80,
        "effort": 5
      }'
    ```
    La API normaliza `confidence`: si envías 0-1 se usa tal cual; si envías 0-100 se divide entre 100. El puntaje se calcula como `(reach * impact * confidence) / effort`.

## Notas
- El archivo `data.db` está ignorado en Git (.gitignore) para evitar subir datos locales.
- Si necesitas reiniciar la información, elimina `data.db` con el servidor detenido y arranca de nuevo.
