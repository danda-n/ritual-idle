import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/alegreya-sans/400.css";
import "@fontsource/alegreya-sans/500.css";
import "@fontsource/alegreya-sans/700.css";
import "@fontsource/alegreya/400.css";
import "@fontsource/alegreya/500.css";
import "@fontsource/alegreya-sc/400.css";
import "@fontsource/alegreya-sc/500.css";
import "./ui/styles/tokens/palette.css";
import "./ui/styles/tokens/semantic.css";
import "./ui/styles/tokens/type.css";
import "./ui/styles/tokens/space.css";
import "./ui/styles/base.css";
import "./ui/styles/components.css";
import "./ui/styles/places.css";
import { App } from "./ui/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
