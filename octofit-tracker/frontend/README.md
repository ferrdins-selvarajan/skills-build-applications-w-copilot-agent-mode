# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## OctoFit API configuration

The presentation tier reads `VITE_CODESPACE_NAME` from Vite's environment to
connect to the API at
`https://<VITE_CODESPACE_NAME>-8000.app.github.dev/api/`. Define it in
`octofit-tracker/frontend/.env.local` before starting the development server or
building the app:

```dotenv
VITE_CODESPACE_NAME=your-codespace-name
```

Restart Vite after changing `.env.local`. If the variable is missing, the app
shows a configuration message instead of requesting a URL containing
`undefined`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
