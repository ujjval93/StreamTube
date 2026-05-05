import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store.js";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#1f2937",
                            color: "#f9fafb",
                        },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </StrictMode>
);