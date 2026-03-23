'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import type { Comment } from '@/types';

export default function CommentSection({
  albumId,
  initialComments,
  currentUserId,
}: {
  albumId: string;
  initialComments: Comment[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({ album_id: albumId, user_id: currentUserId, content: content.trim() })
      .select('*, user:users(*)')
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setContent('');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    const supabase = createClient();
    await supabase.from('comments').delete().eq('id', commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-5">
      <h3 className="font-bold text-sm text-[var(--text)] mb-4 flex items-center gap-2">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h3>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl gradient-candy flex items-center justify-center text-xs font-bold text-white shrink-0">
              {(comment.user as any)?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text)]">{(comment.user as any)?.name}</span>
                <span className="text-xs text-[var(--text-sub)]">
                  {formatDateTime(comment.created_at)}
                </span>
                {comment.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-candy-red/60 hover:text-candy-red"
                  >
                    삭제
                  </button>
                )}
              </div>
              <CommentContent content={comment.content} />
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-[var(--text-sub)] text-center py-4">아직 댓글이 없어요</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (content.trim()) handleSubmit(e);
            }
          }}
          placeholder="댓글을 입력하세요 (Shift+Enter로 줄바꿈)"
          rows={1}
          className="flex-1 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)] resize-none max-h-24"
          onInput={(e) => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 96) + 'px';
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-5 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
        >
          등록
        </button>
      </form>
    </div>
  );
}

function CommentContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split('\n');
  const needsTruncate = lines.length > 3 || content.length > 150;

  if (!needsTruncate || expanded) {
    return (
      <p className="text-sm text-[var(--text)] mt-0.5 whitespace-pre-line">
        {content}
        {needsTruncate && (
          <button onClick={() => setExpanded(false)} className="text-candy-purple text-xs ml-1 font-semibold">접기</button>
        )}
      </p>
    );
  }

  const truncated = lines.slice(0, 3).join('\n').slice(0, 150);

  return (
    <p className="text-sm text-[var(--text)] mt-0.5 whitespace-pre-line">
      {truncated}...
      <button onClick={() => setExpanded(true)} className="text-candy-purple text-xs ml-1 font-semibold">더보기</button>
    </p>
  );
}
