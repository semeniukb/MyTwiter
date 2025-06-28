import { Experience } from "@advanced-react/server/database/schema";
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
import { trpc } from "@/trpc.ts";
import { TextArea } from "@/features/shared/components/ui/TextArea.tsx";
import { useToast } from "@/features/shared/hooks/useToast.ts";

type CommentCreateFormData = z.infer<typeof commentValidationSchema>;

type CommentCreateFormProps = {
  experienceId: Experience["id"];
};

export function CommentCreateForm({ experienceId }: CommentCreateFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<CommentCreateFormData>({
    defaultValues: {
      content: "",
    },
    resolver: zodResolver(commentValidationSchema),
  });

  const addCommentMutation = trpc.comments.add.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async ({ experienceId }) => {
      await Promise.all([
        utils.comments.byExperienceId.invalidate({ experienceId }),
        utils.experiences.feed.invalidate({}),
      ]);

      form.reset();

      toast({ title: "Comment added successfully" });
    },
  });

  const onSubmit = (data: CommentCreateFormData) => {
    addCommentMutation.mutate({
      experienceId,
      content: data.content,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea {...field} placeholder="Add a comment..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addCommentMutation.isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
