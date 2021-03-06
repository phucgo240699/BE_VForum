import { BaseService } from "../../../common/service/common.service";

import { StatusCode } from "../../../common/model/common.model";
import { CommentPost } from "../../../common/model/commentpost.model";

export class PostService extends BaseService {
  constructor(Post: any) {
    super(Post);
  }

  callbackDeleteCommentPost = async (post_id: string) => {
    try {
      CommentPost.updateMany(
        { postId: post_id },
        {
          $set: {
            status: StatusCode.Deactive,
          },
        }
      );
    } catch (error) {
      return console.log(error);
    }
  };
}
