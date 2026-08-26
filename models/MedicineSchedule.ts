import mongoose, { Schema, Model } from "mongoose";

export interface IMedicineSchedule {
  _id: string;
  id?: string;
  medicineName: string;
  targetType: "INDIVIDUAL" | "FLOCK";
  pigeonId?: string | null;
  startDate: string;
  endDate: string;
  dose?: string;
  purpose?: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: string;
}

const MedicineScheduleSchema = new Schema<IMedicineSchedule>(
  {
    _id: { type: String, required: true },
    medicineName: { type: String, required: true },
    targetType: { type: String, enum: ["INDIVIDUAL", "FLOCK"], required: true },
    pigeonId: { type: String, default: null },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    dose: { type: String },
    purpose: { type: String },
    status: {
      type: String,
      enum: ["UPCOMING", "IN_PROGRESS", "COMPLETED"],
      default: "UPCOMING",
    },
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

MedicineScheduleSchema.index({ status: 1 });

const MedicineScheduleModel: Model<IMedicineSchedule> =
  mongoose.models.MedicineSchedule ||
  mongoose.model<IMedicineSchedule>("MedicineSchedule", MedicineScheduleSchema);

export default MedicineScheduleModel;
