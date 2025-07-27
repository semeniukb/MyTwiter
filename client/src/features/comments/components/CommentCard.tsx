import { CommentForList } from "@/features/comments/types.ts";
import Card from "@/features/shared/components/ui/Card.tsx";
import { useState } from "react";
import { CommentEditForm } from "@/features/comments/components/CommentEditForm.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { trpc } from "@/router.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog.tsx";

type CommentCardProps = {
  comment: CommentForList;
};

export function CommentCard({ comment }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <CommentEditForm comment={comment} setIsEditing={setIsEditing} />;
  }

  return (
    <Card className="space-y-4">
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardButtons setIsEditing={setIsEditing} comment={comment} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div>{comment.user.name}</div>
      <time className="text-sm text-neutral-500">
        · {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, "comment">;

function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}

type CommentCardButtonsProps = Pick<CommentCardProps, "comment"> & {
  setIsEditing: (value: boolean) => void;
};

function CommentCardButtons({
  setIsEditing,
  comment,
}: CommentCardButtonsProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.comments.byExperienceId.invalidate({
          experienceId: comment.experienceId,
        }),
        utils.experiences.feed.invalidate(),
      ]);

      setIsDeleteDialogOpen(false);

      toast({
        title: "Comment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-4">
      <Button variant="link" onClick={() => setIsEditing(true)}>
        Edit
      </Button>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive-link">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
          </DialogHeader>
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({ id: comment.id });
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
