import mongoose, { Schema, Model } from "mongoose";

export interface IFeedPurchase {
  _id: string;
  id?: string;
  feedType: string;
  date: string;
  quantityKg: number;
  totalCost: number;
  supplier?: string;
  notes?: string;
}

const FeedPurchaseSchema = new Schema<IFeedPurchase>(
  {
    _id: { type: String, required: true },
    feedType: { type: String, required: true },
    date: { type: String, required: true },
    quantityKg: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    supplier: { type: String },
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

FeedPurchaseSchema.index({ feedType: 1 });
FeedPurchaseSchema.index({ date: -1 });

const FeedPurchaseModel: Model<IFeedPurchase> =
  mongoose.models.FeedPurchase ||
  mongoose.model<IFeedPurchase>("FeedPurchase", FeedPurchaseSchema);

export default FeedPurchaseModel;
