import mongoose, { Schema, Model } from "mongoose";

export interface IPigeon {
  _id: string;
  id?: string;
  ringYear: number;
  ringSerial: number;
  officialRingNumber?: string;
  farmName: string;
  contactNumber: string;
  hatchDate: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  breed: string;
  breedSubtype?: string;
  colorPattern?: string;
  photoUrl?: string;
  photos?: string[];
  fatherId?: string | null;
  motherId?: string | null;
  fatherDetails?: string;
  motherDetails?: string;
  potentialGrade?: string;
  source: "BORN_HIMEL_AGRO" | "PURCHASED";
  purchaseDate?: string;
  purchasePrice?: number;
  seller?: string;
  status: "ACTIVE" | "SOLD" | "DEAD" | "LOST";
  isForSale?: boolean;
  askingPrice?: number;
  saleDate?: string;
  salePrice?: number;
  buyer?: string;
  saleReason?: string;
  deathDate?: string;
  deathReason?: string;
  lostDate?: string;
  lostNotes?: string;
  firstFlyingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PigeonSchema = new Schema<IPigeon>(
  {
    _id: { type: String, required: true },
    ringYear: { type: Number, required: true },
    ringSerial: { type: Number, required: true },
    officialRingNumber: { type: String, default: "" },
    farmName: { type: String, required: true, default: "Himel's Pet House" },
    contactNumber: { type: String, required: true, default: "01560059954" },
    hatchDate: { type: String, required: true },
    sex: { type: String, enum: ["MALE", "FEMALE", "UNKNOWN"], required: true },
    breed: { type: String, required: true },
    breedSubtype: { type: String, default: "" },
    colorPattern: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photos: { type: [String], default: [] },
    fatherId: { type: String, default: null },
    motherId: { type: String, default: null },
    fatherDetails: { type: String, default: "" },
    motherDetails: { type: String, default: "" },
    potentialGrade: { type: String, default: "" },
    source: { type: String, enum: ["BORN_HIMEL_AGRO", "PURCHASED"], required: true },
    purchaseDate: { type: String },
    purchasePrice: { type: Number },
    seller: { type: String },
    status: { type: String, enum: ["ACTIVE", "SOLD", "DEAD", "LOST"], default: "ACTIVE" },
    isForSale: { type: Boolean, default: false },
    askingPrice: { type: Number },
    saleDate: { type: String },
    salePrice: { type: Number },
    buyer: { type: String },
    saleReason: { type: String },
    deathDate: { type: String },
    deathReason: { type: String },
    lostDate: { type: String },
    lostNotes: { type: String },
    firstFlyingDate: { type: String },
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

PigeonSchema.index({ ringYear: 1, ringSerial: 1, farmName: 1 }, { unique: true });
PigeonSchema.index({ status: 1 });
PigeonSchema.index({ status: 1, isForSale: 1 });
PigeonSchema.index({ fatherId: 1 });
PigeonSchema.index({ motherId: 1 });
PigeonSchema.index({ createdAt: -1 });

const PigeonModel: Model<IPigeon> =
  mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", PigeonSchema);

export default PigeonModel;
