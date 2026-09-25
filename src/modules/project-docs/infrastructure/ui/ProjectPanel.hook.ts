import { useRef, useState } from 'react';
import { actions } from 'astro:actions';
import type { ProjectDocumentsResultDto, ProjectDocumentResultDto } from '../../application/dtos';

interface State {
  documents: ProjectDocumentsResultDto | null;
  selectedPath: string;
  document: ProjectDocumentResultDto | null;
  documentLoading: boolean;
}

export interface ProjectPanelView extends State {
  init: () => Promise<void>;
  open: (path: string) => Promise<void>;
}

const initialState: State = {
  documents: null,
  selectedPath: '',
  document: null,
  documentLoading: false,
};

export function useProjectPanel(projectPath: string): ProjectPanelView {
  const [state, setState] = useState<State>(initialState);
  // Clicking quickly through the tree must show the last document asked for, not the last one to arrive.
  const latestRequest = useRef('');

  async function open(path: string): Promise<void> {
    latestRequest.current = path;
    setState((prev) => ({ ...prev, selectedPath: path, documentLoading: true }));
    const response = await actions.readProjectDocument({ projectPath, path });
    if (latestRequest.current !== path) {
      return;
    }
    setState((prev) => ({
      ...prev,
      documentLoading: false,
      document: response.data ?? { kind: 'error', message: 'Failed to load the document' },
    }));
  }

  async function init(): Promise<void> {
    setState(initialState);
    const response = await actions.listProjectDocuments({ projectPath });
    const documents: ProjectDocumentsResultDto = response.data ?? {
      kind: 'error',
      message: 'Failed to load the project documents',
    };
    setState((prev) => ({ ...prev, documents }));
    if (documents.kind === 'ok' && documents.defaultDocument !== null) {
      await open(documents.defaultDocument);
    }
  }

  return { ...state, init, open };
}
