import type { ReactNode, SVGProps } from "react";
import type { SkillId } from "../../content/skills";

// Hand-drawn icon set: 24px grid, 1.75 stroke, round joins, currentColor.
// Woodcut feel comes from chunky shapes and a few solid "ink" fills.

type IconProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function Icon({ size = 20, title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// Skills
export const SprigIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21V8" />
    <path d="M12 13c-3.5 0-5.5-2-6-5 3.3 0 5.4 1.8 6 5Z" fill="currentColor" fillOpacity={0.25} />
    <path d="M12 10c3.2 0 5.2-1.8 5.8-4.6-3.1 0-5.2 1.6-5.8 4.6Z" fill="currentColor" fillOpacity={0.25} />
    <path d="M12 17c2.8 0 4.6-1.4 5.2-3.8-2.7 0-4.6 1.3-5.2 3.8Z" fill="currentColor" fillOpacity={0.25} />
    <circle cx="12" cy="4.5" r="1.5" fill="currentColor" />
  </Icon>
);

export const LanternIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5h6M12 2.5V5" />
    <path d="M8 7h8l-1 11H9L8 7Z" />
    <path d="M8 21h8M10 18v3M14 18v3" />
    <path d="M12 10.5c1.2 1.3 1.2 2.9 0 4-1.2-1.1-1.2-2.7 0-4Z" fill="currentColor" />
  </Icon>
);

export const CandleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3c1.6 1.8 1.6 3.6 0 5-1.6-1.4-1.6-3.2 0-5Z" fill="currentColor" />
    <path d="M12 8v2" />
    <rect x="9" y="10" width="6" height="9" rx="1" />
    <path d="M9 13c1 .8 2 .8 3 0" />
    <path d="M6 21h12" />
  </Icon>
);

export const SigilIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 4.5v15M4.5 12h15" />
    <path d="M7 7l10 10M17 7 7 17" strokeOpacity={0.55} />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </Icon>
);

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6.5c-2-1.6-5-2-8-1.5v13c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5V5c-3-.5-6-.1-8 1.5Z" />
    <path d="M12 6.5v13" />
    <path d="M6.5 9h3M6.5 12h3M14.5 9h3" strokeOpacity={0.6} />
  </Icon>
);

export const CircleRiteIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="2.5 2" />
    <path d="M12 6.5 17 15.5H7L12 6.5Z" />
    <circle cx="12" cy="3.5" r="1" fill="currentColor" />
    <circle cx="19.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="4.5" cy="16.5" r="1" fill="currentColor" />
  </Icon>
);

// Places and categories
export const HouseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
    <path d="M15.5 6V3.5h2V8" />
  </Icon>
);

export const LeafIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 19c0-8 5-13 14-14-.5 9-5.5 14-14 14Z" fill="currentColor" fillOpacity={0.2} />
    <path d="M5 19 14 10" />
  </Icon>
);

export const ScrollIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4h10a2 2 0 0 1 2 2v1h-4" />
    <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7" />
    <path d="M9 9h6M9 12h6M9 15h4" strokeOpacity={0.6} />
  </Icon>
);

export const CoinIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.5" strokeOpacity={0.6} />
    <path d="M12 9.5v5M10 12h4" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5 6 6 0 0 0 19 14.5Z" fill="currentColor" fillOpacity={0.2} />
  </Icon>
);

export const CogIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  </Icon>
);

export const SKILL_ICONS: Record<SkillId, (p: IconProps) => ReactNode> = {
  herbalism: SprigIcon,
  scavenging: LanternIcon,
  chandlery: CandleIcon,
  sigilcraft: SigilIcon,
  scholarship: BookIcon,
  ritualism: CircleRiteIcon,
};

export function SkillIcon({ skill, ...p }: IconProps & { skill: SkillId }) {
  const C = SKILL_ICONS[skill];
  return <C {...p} />;
}
