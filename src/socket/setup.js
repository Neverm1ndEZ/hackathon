// src/socket/setup.ts

export const setupSocketIO = (io) => {
	io.on("connection", (socket) => {
		console.log(`Client connected: ${socket.id}`);

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
		});

		// Add your custom socket events here
	});
};
