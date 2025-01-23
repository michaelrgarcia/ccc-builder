import { createRoot } from "react-dom/client";
import { inject } from '@vercel/analytics';
 

import "./index.css";
import App from "./components/App.jsx";

inject();

createRoot(document.getElementById("root")).render(

    <App />

);
