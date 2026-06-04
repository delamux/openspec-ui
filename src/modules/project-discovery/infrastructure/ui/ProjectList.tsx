import { useEffect } from 'react';
import { useProjectList } from './ProjectList.hook';
import type { DiscoveryResultDto, ProjectDto } from '../../application/dtos';
import styles from './ProjectList.module.css';

export function ProjectList() {
  const view = useProjectList();

  useEffect(() => {
    view.load();
  }, []);

  return <section className={styles.container}>{renderResult(view.result, view.isLoading)}</section>;
}

function renderResult(result: DiscoveryResultDto | null, isLoading: boolean) {
  if (result === null) {
    return <p className={styles.empty}>{isLoading ? 'Loading…' : 'No projects loaded yet.'}</p>;
  }
  if (result.kind === 'not-configured') {
    return (
      <p className={styles.empty}>
        Set <code className={styles.code}>PROJECTS_PATH</code> in your <code className={styles.code}>.env</code>{' '}
        file to an absolute folder path, then restart the dev server.
      </p>
    );
  }
  if (result.kind === 'discovery-error') {
    return <p className={styles.error}>{result.message}</p>;
  }
  if (result.projects.length === 0) {
    return <p className={styles.empty}>No OpenSpec projects found under the configured folder.</p>;
  }
  return <ul className={styles.list}>{result.projects.map((project) => renderCard(project))}</ul>;
}

function renderCard(project: ProjectDto) {
  return (
    <li key={project.path} className={styles.card}>
      <span className={styles.cardName}>{project.name}</span>
      <span className={styles.cardPath}>{project.path}</span>
    </li>
  );
}
