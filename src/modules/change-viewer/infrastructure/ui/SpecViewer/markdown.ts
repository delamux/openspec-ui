// Minimal markdown renderer for spec docs — headings, bold, inline code,
// fenced code, blockquote, lists, and pipe tables. Ported from the design
// prototype; returns an HTML string for a `.prose` container.

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|[\s:|-]+/.test(line) && line.includes('-');
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r/g, '').split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const buffer: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buffer.push(lines[i]);
        i++;
      }
      i++;
      out.push('<pre><code>' + escapeHtml(buffer.join('\n')) + '</code></pre>');
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buffer: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push('<blockquote><p>' + inlineMarkdown(buffer.join(' ')) + '</p></blockquote>');
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const headHtml = head.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('');
      const bodyHtml = rows
        .map((row) => '<tr>' + row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('') + '</tr>')
        .join('');
      out.push(`<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const buffer: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        buffer.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>` + buffer.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('') + `</${tag}>`);
      continue;
    }

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    const buffer: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      buffer.push(lines[i]);
      i++;
    }
    out.push('<p>' + inlineMarkdown(buffer.join(' ')) + '</p>');
  }

  return out.join('\n');
}
