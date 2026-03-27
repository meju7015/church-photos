'use client';

import { useState } from 'react';

export default function ExpandableText({
  text,
  maxLines = 3,
  maxChars = 150,
}: {
  text: string;
  maxLines?: number;
  maxChars?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split('\n');
  const needsTruncate = lines.length > maxLines || text.length > maxChars;

  if (!needsTruncate || expanded) {
    return (
      <p className="text-[var(--text-sub)] text-sm mt-1 whitespace-pre-line">
        {text}
        {needsTruncate && (
          <button
            onClick={() => setExpanded(false)}
            className="text-primary text-xs ml-1 font-semibold"
          >
            접기
          </button>
        )}
      </p>
    );
  }

  const truncated = lines.slice(0, maxLines).join('\n').slice(0, maxChars);

  return (
    <p className="text-[var(--text-sub)] text-sm mt-1 whitespace-pre-line">
      {truncated}...
      <button
        onClick={() => setExpanded(true)}
        className="text-primary text-xs ml-1 font-semibold"
      >
        더보기
      </button>
    </p>
  );
}
