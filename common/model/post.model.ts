import { IModelBase, SchemaBase } from "./common.model";
import mongoose, { Types, Schema } from "mongoose";

export const PostSchemaName = "Post";

export interface IPost extends IModelBase {
  title: string;
  description: string;
  userId: string;
  commentsPost: Types.Array<object>; // 2
  countLike: number;
  countCommentPost: number;
  topicId: string;
}

const PostSchema = new Schema(
  SchemaBase({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    commentsPost: [
      {
        type: Object,
        default: true,
        required: true,
      },
    ],
    countLike: {
      type: Number,
      required: true,
      default: 0,
    },
    countCommentPost: {
      type: Number,
      required: true,
      default: 0,
    },
    topicId: {
      type: String,
      required: true,
    },
  }),
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>(PostSchemaName, PostSchema);
