export type DocumentTreeNode =
  | { kind: 'file'; name: string; path: string }
  | { kind: 'folder'; name: string; path: string; children: DocumentTreeNode[] };

type FolderNode = Extract<DocumentTreeNode, { kind: 'folder' }>;

function folderIn(children: DocumentTreeNode[], name: string, path: string): FolderNode {
  const existing = children.find((node): node is FolderNode => node.kind === 'folder' && node.name === name);
  if (existing !== undefined) {
    return existing;
  }
  const created: FolderNode = { kind: 'folder', name, path, children: [] };
  children.push(created);
  return created;
}

function insert(root: DocumentTreeNode[], path: string): void {
  const segments = path.split('/');
  const fileName = segments[segments.length - 1];
  const parent = segments.slice(0, -1).reduce<DocumentTreeNode[]>(
    (children, segment, index) => folderIn(children, segment, segments.slice(0, index + 1).join('/')).children,
    root,
  );
  parent.push({ kind: 'file', name: fileName, path });
}

function foldersFirst(nodes: DocumentTreeNode[]): DocumentTreeNode[] {
  const folders = nodes.filter((node): node is FolderNode => node.kind === 'folder');
  const files = nodes.filter((node) => node.kind === 'file');
  return [...folders.map((folder) => ({ ...folder, children: foldersFirst(folder.children) })), ...files];
}

// Turns the flat, already-ordered paths of one section into a folder tree.
export function buildDocumentTree(paths: string[]): DocumentTreeNode[] {
  const root: DocumentTreeNode[] = [];
  paths.forEach((path) => insert(root, path));
  return foldersFirst(root);
}
