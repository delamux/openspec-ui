import { useState } from 'react';
import { actions } from 'astro:actions';
import type { DiscoveryResultDto } from '../../application/dtos';

interface ProjectListState {
  isLoading: boolean;
  result: DiscoveryResultDto | null;
}

export interface ProjectListView {
  isLoading: boolean;
  result: DiscoveryResultDto | null;
  load: () => Promise<void>;
}

const initialState: ProjectListState = {
  isLoading: false,
  result: null,
};

export function useProjectList(): ProjectListView {
  const [state, setState] = useState<ProjectListState>(initialState);

  async function load(): Promise<void> {
    setState((prev) => ({ ...prev, isLoading: true }));
    const response = await actions.listProjects();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      result: response.data ?? { kind: 'discovery-error', message: 'Failed to load projects' },
    }));
  }

  return {
    isLoading: state.isLoading,
    result: state.result,
    load,
  };
}
