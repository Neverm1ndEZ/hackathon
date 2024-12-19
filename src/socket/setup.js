// src/socket/setup.ts

export const setupSocketIO = (io) => {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		// Handle user authentication and room joining
		socket.on("join", (userId) => {
			socket.join(userId);
			console.log(`User ${userId} joined their room`);
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});
};
