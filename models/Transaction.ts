import mongoose, { Schema, Model } from "mongoose";

export interface ITransaction {
  _id: string;
  id?: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: string;
  amount: number;
  description?: string;
  pigeonId?: string;
  feedPurchaseId?: string;
  notes?: string;
  createdAt?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    _id: { type: String, required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    pigeonId: { type: String },
    feedPurchaseId: { type: String },
    notes: { type: String },
    createdAt: { type: String },
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

TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ pigeonId: 1 });

const TransactionModel: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default TransactionModel;
