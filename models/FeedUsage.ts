import mongoose, { Schema, Model } from "mongoose";

export interface IFeedUsage {
  _id: string;
  id?: string;
  feedType: string;
  date: string;
  quantityKg: number;
  notes?: string;
}

const FeedUsageSchema = new Schema<IFeedUsage>(
  {
    _id: { type: String, required: true },
    feedType: { type: String, required: true },
    date: { type: String, required: true },
    quantityKg: { type: Number, required: true },
    notes: { type: String },
  },
  {
    _id: false,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

FeedUsageSchema.index({ feedType: 1 });
FeedUsageSchema.index({ date: -1 });

const FeedUsageModel: Model<IFeedUsage> =
  mongoose.models.FeedUsage ||
  mongoose.model<IFeedUsage>("FeedUsage", FeedUsageSchema);

export default FeedUsageModel;
