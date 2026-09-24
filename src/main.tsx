import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/alegreya/400.css";
import "@fontsource/alegreya/400-italic.css";
import "@fontsource/alegreya/500.css";
import "@fontsource/alegreya-sc/400.css";
import "@fontsource/alegreya-sc/500.css";
import "@fontsource/im-fell-english-sc/400.css";
import "./ui/styles/tokens.css";
import "./ui/styles/components.css";
import "./ui/styles/layout.css";
import { App } from "./ui/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
