import mongoose, { Schema, Model } from "mongoose";

export interface IGoat {
  _id: string;
  id?: string;
  sectorId?: "GOAT";
  tagNumber: string; // e.g. "HA-GT-01"
  name?: string;
  breed: string;
  breedSubtype?: string;
  color?: string;
  sex: "MALE" | "FEMALE" | "CASTRATED_MALE";
  birthDate: string;
  status: "ACTIVE" | "PREGNANT" | "LACTATING" | "SOLD" | "DEAD" | "QUARANTINED";
  pregnancyStatus?: "NOT_PREGNANT" | "PREGNANT" | "LACTATING";
  expectedKiddingDate?: string;
  kidsBorn?: number;
  weightKg?: number;
  hornStatus?: "HORNED" | "POLLED" | "DISBUDDED";
  penLocation?: string;
  photoUrl?: string;
  photos?: string[];
  fatherId?: string | null;
  motherId?: string | null;
  fatherDetails?: string;
  motherDetails?: string;
  litterId?: string;
  source: "BORN_HIMEL_AGRO" | "PURCHASED";
  purchaseDate?: string;
  purchasePrice?: number;
  seller?: string;
  saleDate?: string;
  salePrice?: number;
  buyer?: string;
  deathDate?: string;
  deathReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const GoatSchema = new Schema<IGoat>(
  {
    _id: { type: String, required: true },
    sectorId: { type: String, default: "GOAT" },
    tagNumber: { type: String, required: true },
    name: { type: String, default: "" },
    breed: { type: String, required: true },
    breedSubtype: { type: String, default: "" },
    color: { type: String, default: "" },
    sex: { type: String, enum: ["MALE", "FEMALE", "CASTRATED_MALE"], required: true },
    birthDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "PREGNANT", "LACTATING", "SOLD", "DEAD", "QUARANTINED"],
      default: "ACTIVE",
    },
    pregnancyStatus: {
      type: String,
      enum: ["NOT_PREGNANT", "PREGNANT", "LACTATING"],
      default: "NOT_PREGNANT",
    },
    expectedKiddingDate: { type: String },
    kidsBorn: { type: Number, default: 0 },
    weightKg: { type: Number },
    hornStatus: { type: String, enum: ["HORNED", "POLLED", "DISBUDDED"] },
    penLocation: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photos: { type: [String], default: [] },
    fatherId: { type: String, default: null },
    motherId: { type: String, default: null },
    fatherDetails: { type: String, default: "" },
    motherDetails: { type: String, default: "" },
    litterId: { type: String },
    source: { type: String, enum: ["BORN_HIMEL_AGRO", "PURCHASED"], required: true },
    purchaseDate: { type: String },
    purchasePrice: { type: Number },
    seller: { type: String },
    saleDate: { type: String },
    salePrice: { type: Number },
    buyer: { type: String },
    deathDate: { type: String },
    deathReason: { type: String },
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

GoatSchema.index({ tagNumber: 1 }, { unique: true });
GoatSchema.index({ status: 1 });
GoatSchema.index({ breed: 1 });
GoatSchema.index({ sex: 1 });
GoatSchema.index({ fatherId: 1 });
GoatSchema.index({ motherId: 1 });
GoatSchema.index({ createdAt: -1 });

const GoatModel: Model<IGoat> =
  mongoose.models.Goat || mongoose.model<IGoat>("Goat", GoatSchema);

export default GoatModel;
