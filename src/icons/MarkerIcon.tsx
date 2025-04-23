import { IconProps } from './types';

export default function MarkerIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5674dfff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-map-pin"
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
