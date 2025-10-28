import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/dark-bootstrap.css";
import "./index.css";
import "./styles/ui.css";

window.addEventListener("keydown", (e) => {
  try {
    const isF5 = e.key === "F5";
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isF5 && isCtrl) {
      try {
        localStorage.removeItem("arfc:state");
      } catch (err) {
      }

      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
    }
  } catch (err) {
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App/></React.StrictMode>
);
