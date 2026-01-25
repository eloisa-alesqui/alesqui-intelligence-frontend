# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 🐳 Docker Deployment

### Build the Docker image

```bash
docker build -t alesqui-intelligence-frontend .
```

### Run the container

```bash
docker run -d -p 80:80 \
  -e VITE_API_BASE_URL=http://your-backend-url:8080 \
  --name alesqui-frontend \
  alesqui-intelligence-frontend
```

### Health Check

```bash
curl http://localhost/health
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
