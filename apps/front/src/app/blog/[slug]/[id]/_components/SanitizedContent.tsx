'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

type Props = {
  content: string;
  className?: string;
};

const SanitizedContent = ({ content, className }: Props) => {
  const [cleanHtml, setCleanHtml] = useState('');

  useEffect(() => {
    const cleanHtml = DOMPurify.sanitize(content);
    setCleanHtml(cleanHtml);
  }, [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default SanitizedContent;
