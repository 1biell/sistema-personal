import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext"; // 👈 importa o ThemeProvider
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/theme.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* ✅ ativa o contexto global do tema */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
