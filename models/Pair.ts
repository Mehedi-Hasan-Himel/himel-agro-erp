import mongoose, { Schema, Model } from "mongoose";

export interface IPair {
  _id: string;
  id?: string;
  maleId: string;
  femaleId: string;
  startDate: string;
  endDate?: string | null;
  status: "ACTIVE" | "ENDED";
  cageNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PairSchema = new Schema<IPair>(
  {
    _id: { type: String, required: true },
    maleId: { type: String, required: true },
    femaleId: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    status: { type: String, enum: ["ACTIVE", "ENDED"], default: "ACTIVE" },
    cageNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
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

PairSchema.index({ status: 1 });
PairSchema.index({ maleId: 1 });
PairSchema.index({ femaleId: 1 });

const PairModel: Model<IPair> =
  mongoose.models.Pair || mongoose.model<IPair>("Pair", PairSchema);

export default PairModel;
