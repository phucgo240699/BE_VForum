export interface IPostCreateForm {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  topicId: string;
  userId: string;
}

export interface IPostUpdateForm {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}
