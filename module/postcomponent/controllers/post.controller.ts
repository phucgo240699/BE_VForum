import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { IPostCreateForm, IPostUpdateForm } from "../models/post.model";
import {
  serializeCreatePost,
  serializeUpdatePost,
} from "../serializers/post.serializer";

import { Post } from "../../../common/model/post.model";
import { Topic } from "../../../common/model/topic.model";
import { Group } from "../../../common/model/group.model";
import { RoleCode } from "../../../common/model/user.model";
import { StatusCode } from "../../../common/model/common.model";

import { success, error } from "../../../common/service/response.service";
import { CommentPost } from "../../../common/model/commentpost.model";

export class PostController {
  public postservice: PostService = new PostService(Post);

  getAllPost = async (req: Request, res: Response) => {
    try {
      const { topic_id } = req.params;
      const result = await Post.find(
        { status: StatusCode.Active, topicId: topic_id },
        "title description createdBy createdAt countLike countCommentPost commentsPost"
      );
      return success(res, result);
    } catch (err) {
      return error(res, err);
    }
  };

  getPost = async (req: Request, res: Response) => {
    try {
      const { post_id, topic_id } = req.params;
      const result = await Post.find(
        {
          _id: post_id,
          status: StatusCode.Active,
          topicId: topic_id,
        },
        "title description createdBy createdAt countLike countCommentPost commentsPost"
      );
      return success(res, result);
    } catch (err) {
      return error(res, err);
    }
  };

  createPost = async (req: Request, res: Response) => {
    try {
      const { _id, display_name } = req.authorized_user;
      const { group_id, topic_id } = req.params;

      const formPost: IPostCreateForm = req.body;
      const check = await Post.find({
        title: formPost.title,
        description: formPost.description,
        status: StatusCode.Active,
      });
      if (check.length > 0) {
        const messageError =
          "Title, description has been existed. Please enter title, description again";
        return error(res, messageError);
      }

      formPost.createdBy = display_name;
      formPost.userId = _id;
      formPost.topicId = topic_id;

      const post = await this.postservice.create(formPost);
      const messageSuccess = "You have been created post successfully";
      return success(res, serializeCreatePost(post), messageSuccess);
    } catch (err) {
      return error(res, err);
    }
  };

  updatePost = async (req: Request, res: Response) => {
    try {
      const { _id, display_name } = req.authorized_user;
      const { post_id } = req.params;

      const check: any = await Post.find({
        _id: post_id,
        status: StatusCode.Active,
      });

      if (check.length === 0) {
        const messageError = "Post has been deleted. You can not update";
        return error(res, messageError);
      }

      if (check[0].createdBy !== display_name) {
        const messageError =
          "You cannot update post, you aren't owner of topic";
        return error(res, messageError);
      }

      const formPost: IPostUpdateForm = req.body;
      if (
        check[0].title === formPost.title &&
        check[0].description === formPost.description
      ) {
        const messageError = "Sorry!. Please enter title, description again";
        return error(res, messageError);
      }

      const newPost: any = await Post.findByIdAndUpdate(
        post_id,
        {
          $set: {
            title: formPost.title,
            description: formPost.description,
            // updatedBy: display_name,
            isUpdated: true,
          },
        },
        {
          new: true,
          useFindAndModify: false,
        }
      );
      const messageSuccess = "Post have updated successfully";
      return success(res, serializeUpdatePost(newPost), messageSuccess);
    } catch (err) {
      return error(res, err);
    }
  };

  deletePost = async (req: Request, res: Response) => {
    try {
      const { display_name, role } = req.authorized_user;
      const { post_id } = req.params;

      const check: any = await Post.find({
        _id: post_id,
        status: StatusCode.Active,
      });
      if (check.length === 0) {
        const messageError = "Post has been deleted. You can not delete";
        return error(res, messageError);
      }
      if (
        role === RoleCode.Admin ||
        check[0].createdBy === display_name ||
        role === RoleCode.Moderator
      ) {
        await Post.findByIdAndUpdate(post_id, {
          $set: {
            status: StatusCode.Deactive,
          },
        });

        await this.postservice.callbackDeleteCommentPost(post_id);

        const arr: any = await CommentPost.find({ postId: post_id });

        await Post.updateOne(
          { _id: post_id },
          {
            $set: {
              commentsPost: arr,
            },
          }
        );
        const messageSuccess = "You deleted post successfully";
        return success(res, null, messageSuccess);
      }
      const messageError = "You cannot deleted post";
      return error(res, messageError);
    } catch (err) {
      return error(res, err);
    }
  };
}
