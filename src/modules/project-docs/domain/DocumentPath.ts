import { DomainError } from '../../../shared/domain/DomainError';
import { DocumentSection } from './DocumentSection';

export type DocumentFormat = 'markdown' | 'yaml';

export const OPENSPEC_CONFIG = 'openspec/config.yaml';

const MARKDOWN = /\.(md|markdown)$/i;
const AGENT_FOLDERS = ['.claude', '.agents', 'agents', '.github'];
const AGENT_FILES = ['CLAUDE.md', 'AGENTS.md'];
const SPECS_FOLDER = 'openspec/specs/';

// A path relative to a project root that names a document the UI may show:
// a markdown file or the OpenSpec config, never anything outside the project.
export class DocumentPath {
  private constructor(readonly value: string) {}

  static create(raw: string): DocumentPath {
    const normalised = raw.trim().replace(/\\/g, '/').replace(/^(\.\/)+/, '');
    if (normalised.length === 0) {
      throw DomainError.createValidation('Document path must not be empty');
    }
    if (normalised.startsWith('/') || /^[A-Za-z]:/.test(normalised)) {
      throw DomainError.createValidation('Document path must be relative to the project');
    }
    const segments = normalised.split('/');
    if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
      throw DomainError.createValidation('Document path must stay inside the project');
    }
    if (!MARKDOWN.test(normalised) && normalised !== OPENSPEC_CONFIG) {
      throw DomainError.createValidation('Only markdown documents and the OpenSpec config can be opened');
    }
    return new DocumentPath(normalised);
  }

  name(): string {
    return this.value.slice(this.value.lastIndexOf('/') + 1);
  }

  format(): DocumentFormat {
    return this.value === OPENSPEC_CONFIG ? 'yaml' : 'markdown';
  }

  isReadme(): boolean {
    return /^readme\./i.test(this.name());
  }

  section(): DocumentSection {
    if (this.value === OPENSPEC_CONFIG) {
      return DocumentSection.Config;
    }
    if (this.isAgentDocument()) {
      return DocumentSection.Agents;
    }
    if (this.value.startsWith(SPECS_FOLDER)) {
      return DocumentSection.Specs;
    }
    return DocumentSection.Docs;
  }

  private isAgentDocument(): boolean {
    const topFolder = this.value.split('/')[0];
    return AGENT_FOLDERS.includes(topFolder) || AGENT_FILES.includes(this.name());
  }
}
