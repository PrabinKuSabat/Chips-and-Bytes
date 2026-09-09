import React, { useRef } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndown = new TurndownService({
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  headingStyle: 'atx',
  strongDelimiter: '**',
});
turndown.use(gfm);

const hasMarkdownFormatting = (value) => (
  /(^|\n)\s{0,3}#{1,6}\s/.test(value)
  || /(^|\n)\s{0,3}(?:[-*+]\s|\d+\.\s|>\s)/.test(value)
  || /(?:\*\*|__)[^\n]+(?:\*\*|__)/.test(value)
  || /(?:^|[^$])\$\$?[\s\S]+?\$\$?/.test(value)
  || /```[\s\S]*```/.test(value)
  || /\[[^\]]+\]\([^)]+\)/.test(value)
  || /(^|\n)\s*\|.+\|\s*\n\s*\|?\s*:?-{3,}/.test(value)
);

export const getMarkdownClipboardText = (clipboardData) => {
  const plainText = clipboardData?.getData('text/plain') || '';
  const html = clipboardData?.getData('text/html') || '';

  // ChatGPT's copy action includes Markdown source in text/plain. Prefer it
  // when syntax is present so TeX source such as $$ ... $$ is not lost to the
  // rendered HTML representation.
  if (plainText && (hasMarkdownFormatting(plainText) || !html)) return plainText;
  if (html) return turndown.turndown(html);
  return plainText;
};

const MarkdownPasteTextarea = ({ value = '', onChange, onPaste, name, maxLength, ...props }) => {
  const textareaRef = useRef(null);

  const handlePaste = (event) => {
    const html = event.clipboardData?.getData('text/html') || '';
    const plainText = event.clipboardData?.getData('text/plain') || '';
    if (!html && !hasMarkdownFormatting(plainText)) {
      onPaste?.(event);
      return;
    }

    const markdown = getMarkdownClipboardText(event.clipboardData);
    if (!markdown) return;

    event.preventDefault();
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const remainingLength = typeof maxLength === 'number'
      ? Math.max(0, maxLength - (value.length - (end - start)))
      : markdown.length;
    const insertedMarkdown = markdown.slice(0, remainingLength);
    const nextValue = `${value.slice(0, start)}${insertedMarkdown}${value.slice(end)}`;
    onChange?.({ target: { name, value: nextValue } });
    onPaste?.(event);

    window.requestAnimationFrame?.(() => {
      textarea?.setSelectionRange(start + insertedMarkdown.length, start + insertedMarkdown.length);
    });
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      name={name}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onPaste={handlePaste}
    />
  );
};

export default MarkdownPasteTextarea;
