export interface SplitDocument {
  frontMatter: string | null;
  body: string;
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

// Skills and agent files open with a YAML block that the markdown renderer would
// read as a horizontal rule plus paragraphs, so it is shown separately.
export function splitFrontMatter(source: string): SplitDocument {
  const match = FRONT_MATTER.exec(source);
  if (match === null) {
    return { frontMatter: null, body: source };
  }
  return { frontMatter: match[1].replace(/\r/g, ''), body: source.slice(match[0].length) };
}
