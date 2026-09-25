import { useEffect, useState } from 'react';
import { renderMarkdown, renderCodeBlock } from '../../../change-viewer/infrastructure/ui/SpecViewer/markdown';
import type { DocumentSectionDto, ProjectDocumentResultDto } from '../../application/dtos';
import { buildDocumentTree, type DocumentTreeNode } from './documentTree';
import { splitFrontMatter } from './frontMatter';
import { useProjectPanel, type ProjectPanelView } from './ProjectPanel.hook';
import styles from './ProjectPanel.module.css';

interface ProjectPanelProps {
  projectPath: string;
}

function IconFolder(props: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {props.open ? <path d="m6 14 1.5-2.9A2 2 0 0 1 9.2 10H20a2 2 0 0 1 1.9 2.5l-1.5 6A2 2 0 0 1 18.5 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l.8 1.2a2 2 0 0 0 1.7.9H18a2 2 0 0 1 2 2v2" /> : <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />}
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function TreeNode(props: { node: DocumentTreeNode; depth: number; selectedPath: string; onOpen: (path: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const indent = { paddingLeft: `${8 + props.depth * 14}px` };
  if (props.node.kind === 'file') {
    const selected = props.node.path === props.selectedPath;
    const path = props.node.path;
    return (
      <li>
        <button
          type="button"
          className={`${styles.node} ${selected ? styles.selected : ''}`}
          style={indent}
          aria-current={selected ? 'page' : undefined}
          title={path}
          onClick={() => props.onOpen(path)}
        >
          <IconFile />
          <span className={styles.nodeName}>{props.node.name}</span>
        </button>
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        className={`${styles.node} ${styles.folder}`}
        style={indent}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <IconFolder open={expanded} />
        <span className={styles.nodeName}>{props.node.name}</span>
      </button>
      {expanded ? (
        <ul className={styles.tree}>
          {props.node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={props.depth + 1} selectedPath={props.selectedPath} onOpen={props.onOpen} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Section(props: { section: DocumentSectionDto; selectedPath: string; onOpen: (path: string) => void }) {
  return (
    <section className={styles.section} aria-label={props.section.label}>
      <h2 className={styles.sectionTitle}>
        {props.section.label}
        <span className={styles.count}>{props.section.documents.length}</span>
      </h2>
      <ul className={styles.tree}>
        {buildDocumentTree(props.section.documents).map((node) => (
          <TreeNode key={node.path} node={node} depth={0} selectedPath={props.selectedPath} onOpen={props.onOpen} />
        ))}
      </ul>
    </section>
  );
}

function documentHtml(document: Extract<ProjectDocumentResultDto, { kind: 'ok' }>): string {
  if (document.format === 'yaml') {
    return renderCodeBlock(document.content, 'yaml');
  }
  const { frontMatter, body } = splitFrontMatter(document.content);
  const header = frontMatter === null ? '' : renderCodeBlock(frontMatter, 'yaml');
  return header + renderMarkdown(body);
}

function Viewer(props: { view: ProjectPanelView }) {
  const { document, documentLoading, selectedPath } = props.view;
  if (selectedPath === '') {
    return <p className={styles.message}>Select a document to view it.</p>;
  }
  if (documentLoading || document === null) {
    return <p className={styles.message}>Loading document…</p>;
  }
  if (document.kind === 'error') {
    return <p className={styles.message}>{document.message}</p>;
  }
  return (
    <article>
      <p className={styles.docPath}>{document.path}</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: documentHtml(document) }} />
    </article>
  );
}

export function ProjectPanel(props: ProjectPanelProps) {
  const view = useProjectPanel(props.projectPath);

  useEffect(() => {
    view.init();
  }, [props.projectPath]);

  if (view.documents === null) {
    return <p className={styles.message}>Loading project documents…</p>;
  }
  if (view.documents.kind === 'error') {
    return <p className={styles.message}>{view.documents.message}</p>;
  }
  if (view.documents.sections.length === 0) {
    return <p className={styles.message}>This project has no markdown documents.</p>;
  }
  return (
    <div className={styles.panel}>
      <nav className={styles.sidebar} aria-label="Project documents">
        {view.documents.sections.map((section) => (
          <Section key={section.id} section={section} selectedPath={view.selectedPath} onOpen={view.open} />
        ))}
      </nav>
      <div className={styles.content} role="region" aria-label="Document">
        <Viewer view={view} />
      </div>
    </div>
  );
}
