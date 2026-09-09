import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NewsContent from './NewsContent';
import MarkdownPasteTextarea from './MarkdownPasteTextarea';

test('renders ChatGPT-style Markdown and display mathematics', () => {
  const content = [
    '## Memory-system result',
    '',
    'The **measured area** is *approximately*:',
    '',
    '$$ \\sim800\\text{ mm}^2 $$',
  ].join('\n');

  const { container } = render(<NewsContent>{content}</NewsContent>);

  expect(screen.getByRole('heading', { name: 'Memory-system result' })).toBeInTheDocument();
  expect(screen.getByText('measured area')).toHaveProperty('tagName', 'STRONG');
  expect(screen.getByText('approximately')).toHaveProperty('tagName', 'EM');
  expect(container.querySelector('.katex-display')).toBeInTheDocument();
  expect(container.querySelector('.katex')).toHaveTextContent('800');
});

test('renders extended formatting while suppressing raw HTML', () => {
  const content = [
    '- **Fast**',
    '- [Reference](https://example.com)',
    '',
    '> Architecture note',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    '| Area | `800 mm²` |',
    '',
    '<script>window.compromised = true</script>',
  ].join('\n');

  const { container } = render(<NewsContent>{content}</NewsContent>);

  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reference' })).toHaveAttribute('href', 'https://example.com');
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(container.querySelector('blockquote')).toHaveTextContent('Architecture note');
  expect(container.querySelector('code')).toHaveTextContent('800 mm²');
  expect(container.querySelector('script')).not.toBeInTheDocument();
  expect(container).not.toHaveTextContent('window.compromised');
});

test('preserves Markdown clipboard text and converts rich HTML when Markdown is absent', () => {
  const Editor = () => {
    const [value, setValue] = useState('');
    return <MarkdownPasteTextarea name="content" value={value} onChange={(event) => setValue(event.target.value)} />;
  };

  const { rerender } = render(<Editor />);
  const textarea = screen.getByRole('textbox');

  fireEvent.paste(textarea, {
    clipboardData: {
      getData: (type) => type === 'text/plain' ? '**Area**\n\n$$ \\sim800\\text{ mm}^2 $$' : '<p><strong>Area</strong></p>',
    },
  });
  expect(textarea).toHaveValue('**Area**\n\n$$ \\sim800\\text{ mm}^2 $$');

  rerender(<Editor />);
  fireEvent.change(textarea, { target: { value: '' } });
  fireEvent.paste(textarea, {
    clipboardData: {
      getData: (type) => type === 'text/html' ? '<h2>Cache result</h2><p><strong>Fast</strong> and <em>small</em></p>' : 'Cache result Fast and small',
    },
  });
  expect(textarea.value).toContain('## Cache result');
  expect(textarea.value).toContain('**Fast**');
  expect(textarea.value).toContain('_small_');
});

test('converts copied HTML tables to GFM and enforces the content length limit', () => {
  const Editor = () => {
    const [value, setValue] = useState('');
    return <MarkdownPasteTextarea name="content" maxLength={60} value={value} onChange={(event) => setValue(event.target.value)} />;
  };

  render(<Editor />);
  const textarea = screen.getByRole('textbox');
  fireEvent.paste(textarea, {
    clipboardData: {
      getData: (type) => type === 'text/html'
        ? '<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>Area</td><td>800</td></tr></tbody></table>'
        : 'Name Value Area 800',
    },
  });

  expect(textarea.value).toMatch(/\|\s*Name\s*\|\s*Value\s*\|/);
  expect(textarea.value).toMatch(/\|\s*Area\s*\|\s*800\s*\|/);
  expect(textarea.value.length).toBeLessThanOrEqual(60);
});
