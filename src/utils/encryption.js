// src/utils/encryption.ts
// Utility functions for encryption and hashing
import crypto from "crypto";
import bcrypt from "bcrypt";
import { APP_CONSTANTS } from "../config/constants.js";

export class Encryption {
	// Generate a secure random string for tokens
	static generateRandomToken(length: number = 32): string {
		return crypto.randomBytes(length).toString("hex");
	}

	// Hash a password using bcrypt
	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, APP_CONSTANTS.AUTH.SALT_ROUNDS);
	}

	// Compare a password with its hash
	static async comparePassword(
		password: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	}

	// Encrypt sensitive data using AES-256-GCM
	static encryptData(
		data: string,
		key: string = process.env.ENCRYPTION_KEY as string,
	): { encryptedData: string; iv: string; tag: string } {
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv(
			"aes-256-gcm",
			Buffer.from(key, "hex"),
			iv,
		);

		let encrypted = cipher.update(data, "utf8", "hex");
		encrypted += cipher.final("hex");

		return {
			encryptedData: encrypted,
			iv: iv.toString("hex"),
			tag: cipher.getAuthTag().toString("hex"),
		};
	}

	// Decrypt data encrypted with AES-256-GCM
	static decryptData(
		encryptedData: string,
		iv: string,
		tag: string,
		key: string = process.env.ENCRYPTION_KEY as string,
	): string {
		const decipher = crypto.createDecipheriv(
			"aes-256-gcm",
			Buffer.from(key, "hex"),
			Buffer.from(iv, "hex"),
		);

		decipher.setAuthTag(Buffer.from(tag, "hex"));

		let decrypted = decipher.update(encryptedData, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	}
}
