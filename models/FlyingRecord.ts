import mongoose, { Schema, Model } from "mongoose";

export interface IFlyingRecord {
  _id: string;
  id?: string;
  pigeonId: string;
  date: string;
  eventName?: string;
  flightDurationMinutes?: number;
  result?: string;
  weather?: string;
  notes?: string;
  createdAt?: string;
}

const FlyingRecordSchema = new Schema<IFlyingRecord>(
  {
    _id: { type: String, required: true },
    pigeonId: { type: String, required: true },
    date: { type: String, required: true },
    eventName: { type: String },
    flightDurationMinutes: { type: Number },
    result: { type: String },
    weather: { type: String },
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

FlyingRecordSchema.index({ pigeonId: 1 });

const FlyingRecordModel: Model<IFlyingRecord> =
  mongoose.models.FlyingRecord ||
  mongoose.model<IFlyingRecord>("FlyingRecord", FlyingRecordSchema);

export default FlyingRecordModel;
