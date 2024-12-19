import { EventEmitter } from "events";
import { APP_CONSTANTS } from "../../config/constants.js";

export class MeshNetwork extends EventEmitter {
	constructor(io) {
		super();
		this.io = io;
		this.peers = new Map();
		this.messageCache = new Map();

		// Clean up expired messages periodically
		setInterval(
			() => this.cleanupMessageCache(),
			APP_CONSTANTS.MESH.MESSAGE_TTL,
		);
	}

	cleanupMessageCache() {
		const now = Date.now();
		for (const [messageId, { timestamp }] of this.messageCache.entries()) {
			if (now - timestamp > APP_CONSTANTS.MESH.MESSAGE_TTL) {
				this.messageCache.delete(messageId);
			}
		}
	}

	handleConnection(socketId, userId) {
		// Initialize peer's connections set if it doesn't exist
		if (!this.peers.has(userId)) {
			this.peers.set(userId, new Set());
		}

		// Add socket connection to peer's set
		this.peers.get(userId).add(socketId);

		// Emit peer connection event
		this.emit("peerConnected", { userId, socketId });
	}

	handleDisconnection(socketId, userId) {
		// Remove socket from peer's connections
		this.peers.get(userId).delete(socketId);

		// If no more connections, remove peer entirely
		if (this.peers.get(userId).size === 0) {
			this.peers.delete(userId);
			this.emit("peerDisconnected", userId);
		}
	}

	broadcastMessage(message, sourceId) {
		const messageId = `${sourceId}-${Date.now()}`;

		// Check if message was already processed
		if (this.messageCache.has(messageId)) return;

		// Cache the message
		this.messageCache.set(messageId, {
			timestamp: Date.now(),
			data: message,
		});

		// Broadcast to all connected peers except source
		this.peers.forEach((sockets, peerId) => {
			if (peerId !== sourceId) {
				sockets.forEach((socketId) => {
					this.io.to(socketId).emit("mesh:message", {
						messageId,
						data: message,
						source: sourceId,
					});
				});
			}
		});
	}

	getPeerCount() {
		return this.peers.size;
	}

	isConnected(userId) {
		return this.peers.has(userId);
	}
}
