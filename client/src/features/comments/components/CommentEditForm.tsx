import { Comment } from "@advanced-react/server/database/schema";
import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form.tsx";
import { Button } from "@/features/shared/components/ui/Button.tsx";
import { trpc } from "@/router.tsx";
import { TextArea } from "@/features/shared/components/ui/TextArea.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";
import React from "react";

type CommentEditFormData = z.infer<typeof commentValidationSchema>;

type CommentEditFormProps = {
  comment: Comment;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CommentEditForm({
  comment,
  setIsEditing,
}: CommentEditFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<CommentEditFormData>({
    defaultValues: {
      content: comment.content,
    },
    resolver: zodResolver(commentValidationSchema),
  });

  const editMutation = trpc.comments.edit.useMutation({
    onSuccess: async ({ experienceId }) => {
      await utils.comments.byExperienceId.invalidate({
        experienceId,
      });

      setIsEditing(false);

      toast({
        title: "Comment edited successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to edit comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentEditFormData) => {
    editMutation.mutate({
      id: comment.id,
      content: data.content,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={editMutation.isPending}>
            {editMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="link"
            onClick={() => setIsEditing(false)}
            disabled={editMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
