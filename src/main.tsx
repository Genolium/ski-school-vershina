import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Яндекс.Метрика инициализируется в index.html
// Дополнительная инициализация через JS не требуется, так как код уже в HTML

createRoot(document.getElementById("root")!).render(<App />);
