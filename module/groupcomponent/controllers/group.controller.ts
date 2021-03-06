import { Request, Response } from "express";

import { GroupService } from "../services/group.service";
import { success, error } from "../../../common/service/response.service";

import { StatusCode } from "../../../common/model/common.model";
import { Group } from "../../../common/model/group.model";
import { RoleCode } from "../../../common/model/user.model";

import { IGroupCreateForm, IGroupUpdateForm } from "../models/group.model";
import {
  serialCreateGroup,
  serialUpdateGroup,
} from "../serializers/group.serializer";

export class GroupController {
  public groupService: GroupService = new GroupService(Group);

  getAllGroup = async (req: Request, res: Response) => {
    try {
      const { _id } = req.authorized_user;
      console.log(_id);
      const result = await Group.find(
        { status: StatusCode.Active },
        "name createdBy createdAt"
      ).sort({ updatedAt: -1 });
      return success(res, result);
    } catch (err) {
      return error(res, "Error", 200);
    }
  };

  getGroup = async (req: Request, res: Response) => {
    try {
      const { group_id } = req.params;

      const result = await Group.find(
        {
          status: StatusCode.Active,
          _id: group_id,
        },
        "name createdBy createdAt"
      );
      return success(res, result);
    } catch (err) {
      return error(res, "Error", 200);
    }
  };

  createGroup = async (req: Request, res: Response) => {
    try {
      const { role, display_name } = req.authorized_user;
      if (role === RoleCode.Admin) {
        const formGroup: IGroupCreateForm = req.body;

        const check = await Group.find({
          name: formGroup.name,
          status: StatusCode.Active,
        });
        if (check.length > 0) {
          const messageError = "Name has been existed. Please enter name again";
          return error(res, messageError, 200);
        }

        formGroup.createdBy = display_name;
        const group = await this.groupService.create(formGroup);
        const messageSuccess = "You have been created group successfully";
        return success(res, serialCreateGroup(group), messageSuccess, 201);
      }
      const messageError = "You cannot create group, you aren't admin";
      return error(res, messageError, 200);
    } catch (err) {
      return error(res, "Error", 200);
    }
  };

  updateGroup = async (req: Request, res: Response) => {
    try {
      const { role } = req.authorized_user;
      const { group_id } = req.params;

      if (role === RoleCode.Admin || role === RoleCode.Moderator) {
        const formGroup: IGroupUpdateForm = req.body;

        const check: any = await Group.find({
          _id: group_id,
          status: StatusCode.Active,
        });
        if (check.length === 0) {
          const messageError = "Group has been deleted. You can not update";
          return error(res, messageError, 200);
        }

        const arr = await Group.find({ name: formGroup.name });

        if (check[0].name === formGroup.name || arr.length > 0) {
          const messageError = "Sorry!. Please enter name again";
          return error(res, messageError, 200);
        }

        const group: any = await Group.findByIdAndUpdate(
          group_id,
          {
            $set: {
              name: formGroup.name,
              isUpdated: true,
            },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );
        const messageSuccess = "Group have updated successfully";
        return success(res, serialUpdateGroup(group), messageSuccess);
      }
      const messageError = "You cannot update group";
      return error(res, messageError, 200);
    } catch (err) {
      return error(res, "Error", 200);
    }
  };

  deleteGroup = async (req: Request, res: Response) => {
    try {
      const { role } = req.authorized_user;
      if (role === RoleCode.Admin) {
        const { group_id } = req.params;

        const check: any = await Group.find({
          _id: group_id,
          status: StatusCode.Active,
        });
        if (check.length === 0) {
          const messageError = "Group has been deleted. You can not delete";
          return error(res, messageError, 200);
        }

        await Group.findByIdAndUpdate(group_id, {
          $set: {
            status: StatusCode.Deactive,
          },
        });

        await this.groupService.callbackDeleteTopic(group_id);
        await this.groupService.callbackDeletePost(group_id);

        const messageSuccess = "You deleted group successfully";
        return success(res, null, messageSuccess);
      }

      const messageError = "You cannot delete group";
      return error(res, messageError, 200);
    } catch (err) {
      return error(res, "Error", 200);
    }
  };
}
