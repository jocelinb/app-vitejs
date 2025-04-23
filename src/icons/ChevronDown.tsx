import { IconProps } from './types';

export default function ChevronDown(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-chevron-down"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
