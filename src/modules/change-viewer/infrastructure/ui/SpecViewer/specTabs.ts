export const SPEC_TABS = ['proposal', 'specs', 'design', 'tasks'] as const;

export type SpecTab = (typeof SPEC_TABS)[number];

export const DEFAULT_SPEC_TAB: SpecTab = 'proposal';

export function specTabFrom(raw: string): SpecTab {
  return SPEC_TABS.find((tab) => tab === raw) ?? DEFAULT_SPEC_TAB;
}
