'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import type { Comment } from '@/types';
import UserAvatar from './UserAvatar';

export default function CommentSection({
  albumId,
  bulletinId,
  initialComments,
  currentUserId,
}: {
  albumId?: string;
  bulletinId?: string;
  initialComments: Comment[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ album_id: albumId, bulletin_id: bulletinId, content: content.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setContent('');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    const supabase = createClient();
    await supabase.from('comments').delete().eq('id', commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setDeletingId(null);
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-5">
      <h3 className="font-semibold text-base text-[var(--text)] mb-5 flex items-center gap-2">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h3>

      <div className="space-y-4 mb-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar name={(comment.user as any)?.name || '?'} avatarUrl={(comment.user as any)?.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text)]">{(comment.user as any)?.name}</span>
                <span className="text-xs text-[var(--text-sub)]">
                  {formatDateTime(comment.created_at)}
                </span>
                {comment.user_id === currentUserId && (
                  deletingId === comment.id ? (
                    <svg className="w-3 h-3 animate-spin text-danger" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-danger/60 hover:text-danger"
                    >
                      삭제
                    </button>
                  )
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
          className="flex-1 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)] resize-none max-h-24"
          onInput={(e) => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 96) + 'px';
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shrink-0 btn-press"
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
          <button onClick={() => setExpanded(false)} className="text-primary text-xs ml-1 font-semibold">접기</button>
        )}
      </p>
    );
  }

  const truncated = lines.slice(0, 3).join('\n').slice(0, 150);

  return (
    <p className="text-sm text-[var(--text)] mt-0.5 whitespace-pre-line">
      {truncated}...
      <button onClick={() => setExpanded(true)} className="text-primary text-xs ml-1 font-semibold">더보기</button>
    </p>
  );
}
