import mongoose, { Schema, Model } from "mongoose";

export interface IBreedingRound {
  _id: string;
  id?: string;
  pairId: string;
  roundNumber: number;
  date?: string;
  hatchDate?: string;
  eggsLaid: number;
  babiesHatched: number;
  babyPigeonIds: string[];
  notes?: string;
  createdAt: string;
}

const BreedingRoundSchema = new Schema<IBreedingRound>(
  {
    _id: { type: String, required: true },
    pairId: { type: String, required: true },
    roundNumber: { type: Number, required: true },
    date: { type: String },
    hatchDate: { type: String },
    eggsLaid: { type: Number, required: true, default: 0 },
    babiesHatched: { type: Number, required: true, default: 0 },
    babyPigeonIds: { type: [String], default: [] },
    notes: { type: String, default: "" },
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

BreedingRoundSchema.index({ pairId: 1 });
BreedingRoundSchema.index({ babyPigeonIds: 1 });
BreedingRoundSchema.index({ date: -1 });

const BreedingRoundModel: Model<IBreedingRound> =
  mongoose.models.BreedingRound ||
  mongoose.model<IBreedingRound>("BreedingRound", BreedingRoundSchema);

export default BreedingRoundModel;
