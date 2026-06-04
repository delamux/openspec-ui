import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  fill?: string;
}

interface BaseIconProps extends IconProps {
  children: ReactNode;
}

function Icon(props: BaseIconProps) {
  const size = props.size ?? 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={props.fill ?? 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {props.children}
    </svg>
  );
}

export function IconProposal(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Icon>
  );
}

export function IconDesign(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </Icon>
  );
}

export function IconTasks(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M11 12H3" />
      <path d="M16 6H3" />
      <path d="M16 18H3" />
      <path d="m17 12 2 2 4-4" />
    </Icon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Icon size={props.size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Icon>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon size={props.size}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}
