# Stockroom - React frontend for the LavaLust Product API

React 18 + Vite + Axios. Features: login / register, product list (with search),
add, edit, delete, logout. Token refresh is automatic. The app talks **only** to the LavaLust API
(never directly to Aiven MySQL).

## Run

```bash
npm install
cp .env.example .env     # set VITE_API_URL (API base URL, no trailing slash)
npm run dev              # http://localhost:5173
```
The API must allow this origin: set `CORS_ORIGIN=http://localhost:5173` in the API `.env`.

## Deploy (Render Static Site)

* New + -> **Static Site** -> pick the frontend repo
* Build command: `npm install && npm run build`
* Publish directory: `dist`
* Environment variable: `VITE_API_URL=https://<your-api>.onrender.com`
* Then put the static site URL into the API's `CORS_ORIGIN` on Render.
