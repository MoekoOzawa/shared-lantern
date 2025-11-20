// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// 本番（GitHub Pages）だけ /shared-lantern/ を付ける
const basename =
  import.meta.env.MODE === "production" ? "/shared-lantern/" : "/";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
