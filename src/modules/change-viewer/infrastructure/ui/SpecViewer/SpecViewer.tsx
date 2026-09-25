import { useState } from 'react';
import { Tabs, type TabItem } from '../../../../../shared/infrastructure/ui/components';
import { renderMarkdown } from './markdown';
import { TasksView } from './TasksView';
import { IconProposal, IconSpecs, IconDesign, IconTasks } from './icons';
import type { ChangeSpecDto, ChangeViewDto } from '../../../application/dtos';
import styles from './SpecViewer.module.css';

type TabId = 'proposal' | 'specs' | 'design' | 'tasks';

const TABS: TabItem[] = [
  { id: 'proposal', label: 'Proposal', icon: <IconProposal size={16} /> },
  { id: 'specs', label: 'Specs', icon: <IconSpecs size={16} /> },
  { id: 'design', label: 'Design', icon: <IconDesign size={16} /> },
  { id: 'tasks', label: 'Tasks', icon: <IconTasks size={16} /> },
];

interface SpecViewerProps {
  view: ChangeViewDto;
  projectPath: string;
  changeName: string;
  onChanged: () => Promise<void>;
}

function Markdown(props: { source: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(props.source) }} />;
}

function Empty(props: { label: string }) {
  return <p className={styles.empty}>{props.label}</p>;
}

// A change can carry one delta spec per capability; a picker appears only when there is more than one.
function SpecsView(props: { specs: ChangeSpecDto[] }) {
  const [selected, setSelected] = useState(props.specs[0]?.capability ?? '');
  const current = props.specs.find((spec) => spec.capability === selected) ?? props.specs[0];
  return (
    <div className={styles.specs}>
      {props.specs.length > 1 ? (
        <div className={styles.capabilities} role="group" aria-label="Capability">
          {props.specs.map((spec) => (
            <button
              key={spec.capability}
              type="button"
              className={`${styles.capability} ${spec.capability === current.capability ? styles.capabilityActive : ''}`}
              aria-pressed={spec.capability === current.capability}
              onClick={() => setSelected(spec.capability)}
            >
              {spec.capability}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.capabilityName}>{current.capability}</p>
      )}
      <Markdown source={current.content} />
    </div>
  );
}

export function SpecViewer(props: SpecViewerProps) {
  const [active, setActive] = useState<TabId>('proposal');

  return (
    <div className={styles.viewer}>
      <div className={styles.tabbarWrap}>
        <Tabs items={TABS} active={active} onSelect={(id) => setActive(id as TabId)} />
      </div>
      <div className={styles.content} role="tabpanel">
        {active === 'proposal'
          ? props.view.proposal !== null
            ? <Markdown source={props.view.proposal} />
            : <Empty label="This change has no proposal." />
          : null}
        {active === 'specs'
          ? props.view.specs.length > 0
            ? <SpecsView key={props.changeName} specs={props.view.specs} />
            : <Empty label="This change has no delta specs." />
          : null}
        {active === 'design'
          ? props.view.design !== null
            ? <Markdown source={props.view.design} />
            : <Empty label="This change has no design document." />
          : null}
        {active === 'tasks'
          ? props.view.tasks !== null
            ? (
              <TasksView
                key={props.changeName}
                groups={props.view.tasks}
                progress={props.view.progress}
                projectPath={props.projectPath}
                changeName={props.changeName}
                onChanged={props.onChanged}
              />
            )
            : <Empty label="This change has no task list." />
          : null}
      </div>
    </div>
  );
}
