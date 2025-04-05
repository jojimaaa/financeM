import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";

// Ensure the element exists before calling createRoot
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Root element not found. Please ensure an element with id 'root' exists in the DOM."
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
