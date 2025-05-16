# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Gemini Chat App Backend

## How to run

1. Make sure you have Python 3.9+ and pip installed.
2. Install dependencies:
   pip install fastapi uvicorn pydantic requests
3. Start the backend server:
   uvicorn backend:app --reload

The backend will be available at http://127.0.0.1:8000

## Endpoints
- POST /chat: Send a message to the Gemini API (currently echoes your message).

---

# Gemini Chat App Frontend

The frontend is a Vite + React app (already scaffolded).

## How to run

1. Install dependencies:
   npm install
2. Start the frontend:
   npm run dev

The frontend will be available at http://localhost:5173

---

## Hosting Frontend and Backend Together

1. Build the React frontend:
   npm run build
   (This creates a `dist` folder with the production build.)

2. Start the FastAPI backend:
   uvicorn backend:app --reload
   (This will serve both the API and the frontend at the same port, e.g., http://localhost:8000)

- Access your app at http://localhost:8000
- API requests to /chat will work as before.
- All static frontend files are served from /static and the root path.

---

## Next Steps
- Connect the React frontend to the backend by sending chat messages to http://127.0.0.1:8000/chat
- Update the backend to call the real Gemini API.
