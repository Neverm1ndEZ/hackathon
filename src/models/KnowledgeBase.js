import mongoose from "mongoose";
const { Schema } = mongoose;

const KnowledgeBaseSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			index: "text", // Enable text search on titles
		},
		category: {
			type: String,
			required: true,
			enum: [
				"FIRST_AID",
				"DISASTER_RESPONSE",
				"SURVIVAL",
				"TECHNICAL",
				"GENERAL",
			],
		},
		content: {
			type: String,
			required: true,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		version: {
			type: Number,
			required: true,
			default: 1,
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		region: [
			{
				type: String,
				trim: true,
			},
		],
		language: {
			type: String,
			required: true,
			default: "en",
		},
		priority: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			max: 100,
		},
		offline: {
			type: Boolean,
			required: true,
			default: false,
		},
		attachments: [
			{
				name: {
					type: String,
					required: true,
				},
				type: {
					type: String,
					required: true,
				},
				size: {
					type: Number,
					required: true,
				},
				url: {
					type: String,
					required: true,
				},
			},
		],
		metadata: {
			sourceUrl: String,
			lastVerified: Date,
			reviewStatus: {
				type: String,
				enum: ["PENDING", "APPROVED", "REJECTED"],
				default: "PENDING",
			},
			verifiedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for efficient querying
KnowledgeBaseSchema.index({ category: 1, language: 1 });
KnowledgeBaseSchema.index({ tags: 1 });
KnowledgeBaseSchema.index({ "metadata.reviewStatus": 1 });
KnowledgeBaseSchema.index({ priority: -1, lastUpdated: -1 });

// Version control middleware
KnowledgeBaseSchema.pre("save", function (next) {
	if (this.isModified("content")) {
		this.version += 1;
		this.lastUpdated = new Date();
	}
	next();
});

// Static method to find relevant knowledge base articles
KnowledgeBaseSchema.statics.findRelevant = async function (
	query,
	category,
	language = "en",
	limit = 10,
) {
	const filter = { language };
	if (category) filter.category = category;

	return this.find({
		...filter,
		$text: { $search: query },
	})
		.sort({ score: { $meta: "textScore" }, priority: -1 })
		.limit(limit);
};

export const KnowledgeBase = mongoose.model(
	"KnowledgeBase",
	KnowledgeBaseSchema,
);
