export enum DocumentSection {
  Config = 'config',
  Agents = 'agents',
  Specs = 'specs',
  Docs = 'docs',
}

export const SECTION_ORDER: DocumentSection[] = [
  DocumentSection.Config,
  DocumentSection.Agents,
  DocumentSection.Specs,
  DocumentSection.Docs,
];
