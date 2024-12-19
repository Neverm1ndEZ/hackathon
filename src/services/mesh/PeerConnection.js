// src/services/mesh/PeerConnection.ts
import { EventEmitter } from "events";
import { APP_CONSTANTS } from "../../config/constants.js";

interface Peer {
	id: string;
	lastPing: number;
	status: "CONNECTING" | "CONNECTED" | "DISCONNECTED";
	metadata?: Record<string, any>;
}

export class PeerConnection extends EventEmitter {
	private peers: Map<string, Peer>;
	private pingInterval: NodeJS.Timeout;
	private reconnectInterval: NodeJS.Timeout;

	constructor() {
		super();
		this.peers = new Map();

		// Start ping interval to check peer health
		this.pingInterval = setInterval(
			() => this.pingPeers(),
			APP_CONSTANTS.MESH.PING_INTERVAL,
		);

		// Start reconnection attempts for disconnected peers
		this.reconnectInterval = setInterval(
			() => this.attemptReconnections(),
			APP_CONSTANTS.MESH.RECONNECT_INTERVAL,
		);
	}

	public addPeer(peerId: string, metadata?: Record<string, any>): void {
		if (this.peers.size >= APP_CONSTANTS.MESH.MAX_PEERS) {
			this.emit("error", new Error("Maximum peer limit reached"));
			return;
		}

		this.peers.set(peerId, {
			id: peerId,
			lastPing: Date.now(),
			status: "CONNECTING",
			metadata,
		});

		this.emit("peerAdded", { peerId, metadata });
	}

	public removePeer(peerId: string): void {
		const peer = this.peers.get(peerId);
		if (peer) {
			this.peers.delete(peerId);
			this.emit("peerRemoved", peerId);
		}
	}

	public updatePeerStatus(peerId: string, status: Peer["status"]): void {
		const peer = this.peers.get(peerId);
		if (peer) {
			peer.status = status;
			peer.lastPing = Date.now();
			this.peers.set(peerId, peer);
			this.emit("peerStatusChanged", { peerId, status });
		}
	}

	private pingPeers(): void {
		const now = Date.now();
		this.peers.forEach((peer, peerId) => {
			if (peer.status === "CONNECTED") {
				// If peer hasn't responded for twice the ping interval, mark as disconnected
				if (now - peer.lastPing > APP_CONSTANTS.MESH.PING_INTERVAL * 2) {
					this.updatePeerStatus(peerId, "DISCONNECTED");
				} else {
					this.emit("ping", peerId);
				}
			}
		});
	}

	private attemptReconnections(): void {
		this.peers.forEach((peer, peerId) => {
			if (peer.status === "DISCONNECTED") {
				this.updatePeerStatus(peerId, "CONNECTING");
				this.emit("reconnectAttempt", peerId);
			}
		});
	}

	public handlePeerMessage(peerId: string, message: any): void {
		const peer = this.peers.get(peerId);
		if (!peer) {
			this.emit(
				"error",
				new Error(`Message received from unknown peer: ${peerId}`),
			);
			return;
		}

		// Update peer's last ping time
		peer.lastPing = Date.now();
		this.peers.set(peerId, peer);

		// Emit the message for processing
		this.emit("message", { peerId, message });
	}

	public getPeerStatus(peerId: string): Peer["status"] | null {
		return this.peers.get(peerId)?.status || null;
	}

	public getConnectedPeers(): string[] {
		return Array.from(this.peers.entries())
			.filter(([_, peer]) => peer.status === "CONNECTED")
			.map(([peerId]) => peerId);
	}

	public destroy(): void {
		clearInterval(this.pingInterval);
		clearInterval(this.reconnectInterval);
		this.peers.clear();
		this.removeAllListeners();
	}
}
