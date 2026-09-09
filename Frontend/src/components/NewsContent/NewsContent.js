import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import './NewsContent.css';

const markdownPlugins = [remarkGfm, remarkMath];
const htmlPlugins = [[rehypeKatex, { throwOnError: false, strict: 'warn', trust: false }]];
const normalizeDisplayMath = (value) => value.replace(
  /\$\$[ \t]*([^\n]+?)[ \t]*\$\$/g,
  (_, expression) => `$$\n${expression}\n$$`,
);

const NewsContent = ({ children = '', className = '' }) => (
  <div className={['news-content', className].filter(Boolean).join(' ')}>
    <ReactMarkdown
      remarkPlugins={markdownPlugins}
      rehypePlugins={htmlPlugins}
      skipHtml
    >
      {normalizeDisplayMath(String(children))}
    </ReactMarkdown>
  </div>
);

export default NewsContent;
