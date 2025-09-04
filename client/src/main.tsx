import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// register service worker from public (will be copied to dist/public/sw.js)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch((err) => {
			// registration failed
			console.warn('SW registration failed:', err);
		});
	});
}
