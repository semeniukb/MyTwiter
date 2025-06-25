import { Experience, User } from "@advanced-react/server/database/schema";

type ExperiencesWithUser = Experience & {
  user: User;
};

type ExperiencesWithCommentCount = {
  commentsCount: number;
};

export type ExperienceForList = ExperiencesWithUser &
  ExperiencesWithCommentCount;
