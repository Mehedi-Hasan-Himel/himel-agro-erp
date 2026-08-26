import mongoose, { Schema, Model } from "mongoose";

export type ConfigType = "SETTINGS" | "BREEDS";

export interface IAppConfig {
  _id: ConfigType;
  id?: string;
  data: Record<string, unknown>;
}

const AppConfigSchema = new Schema<IAppConfig>(
  {
    _id: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
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

const AppConfigModel: Model<IAppConfig> =
  mongoose.models.AppConfig ||
  mongoose.model<IAppConfig>("AppConfig", AppConfigSchema);

export default AppConfigModel;
