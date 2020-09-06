import { IModelBase, SchemaBase } from "./common.model";
import mongoose, { Types } from "mongoose";

export enum GenderCode {
  Male = "male",
  Female = "female",
  Lgbt = "lgbt",
}

export enum RoleCode {
  Member = "member",
  Moderator = "moderator",
  Admin = "admin",
}

export const UserSchemaName = "User";

export interface IUser extends IModelBase {
  email: string;
  password: string;
  display_name: string;
  gender: string;
  role: string;
  groups: Types.Array<object>;
  feeds: Types.Array<object>;
}

export const UserSchema = new mongoose.Schema(
  SchemaBase({
    email: {
      type: String,
      unique: true,
      required: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
      type: String,
      required: true,
    },
    display_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: [GenderCode.Female, GenderCode.Male, GenderCode.Lgbt],
      required: true,
    },
    role: {
      type: String,
      enum: [RoleCode.Admin, RoleCode.Member, RoleCode.Moderator],
      default: RoleCode.Member,
      required: true,
    },
    feeds: [
      {
        type: Object,
        default: true,
      },
    ],
    groups: [
      {
        type: Object,
        default: true,
      },
    ],
    // createdAt: {
    //   type: String,
    //   default: true,
    // },
    // updatedAt: {
    //   type: String,
    //   default: true,
    // },
  }),
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>(UserSchemaName, UserSchema);
