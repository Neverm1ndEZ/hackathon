export async function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceWorker.register(
				"/service-worker.js",
			);
			console.log("Service Worker registered:", registration);
		} catch (error) {
			console.error("Service Worker registration failed:", error);
		}
	}
}
