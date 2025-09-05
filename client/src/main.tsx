import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// register service worker from public (will be copied to dist/public/sw.js)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then((registration) => {
			// Listen for updates to the service worker.
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed') {
							if (navigator.serviceWorker.controller) {
								console.info('New content is available; please refresh.');
							} else {
								console.info('Content is cached for offline use.');
							}
						}
					});
				}
			});
		}).catch((err) => {
			// registration failed
			console.warn('SW registration failed:', err);
		});
	});
}
