import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import { formatRelativeTime } from "@/lib/format";

type CommentData = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: { name: string };
};

export default function CommentSection({
  novelId,
  chapterId,
  comments,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: {
  novelId: string;
  chapterId?: string;
  comments: CommentData[];
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-paper">
        Сэтгэгдэл <span className="text-mist-dim">({comments.length})</span>
      </h3>

      <CommentForm novelId={novelId} chapterId={chapterId} isLoggedIn={isLoggedIn} />

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-plum/30 text-xs font-semibold text-plum-soft">
                  {comment.user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-paper">{comment.user.name}</span>
                <span className="text-xs text-mist-dim">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              {(comment.userId === currentUserId || isAdmin) && (
                <DeleteCommentButton commentId={comment.id} />
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-mist">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-mist-dim">Хараахан сэтгэгдэл байхгүй байна. Анхных нь бичээрэй!</p>
        )}
      </div>
    </div>
  );
}
