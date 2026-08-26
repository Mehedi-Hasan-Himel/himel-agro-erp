import mongoose, { Schema, Model } from "mongoose";

export interface IHealthRecord {
  _id: string;
  id?: string;
  targetType: "INDIVIDUAL" | "FLOCK";
  pigeonId?: string | null;
  medicineName: string;
  startDate: string;
  endDate: string;
  dose?: string;
  purpose?: string;
  notes?: string;
  createdAt: string;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    _id: { type: String, required: true },
    targetType: { type: String, enum: ["INDIVIDUAL", "FLOCK"], required: true },
    pigeonId: { type: String, default: null },
    medicineName: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    dose: { type: String },
    purpose: { type: String },
    notes: { type: String },
    createdAt: { type: String, required: true },
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

HealthRecordSchema.index({ pigeonId: 1 });

const HealthRecordModel: Model<IHealthRecord> =
  mongoose.models.HealthRecord ||
  mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);

export default HealthRecordModel;
