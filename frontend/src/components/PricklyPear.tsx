/** Prickly pear cactus mark: used as the logo and as the stand-in for product photos. */
export default function PricklyPear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-hidden="true">
      <ellipse cx="60" cy="82" rx="26" ry="32" fill="var(--cactus)" />
      <ellipse cx="34" cy="48" rx="16" ry="21" fill="var(--cactus)" transform="rotate(-28 34 48)" />
      <ellipse cx="86" cy="46" rx="15" ry="20" fill="var(--cactus)" transform="rotate(24 86 46)" />
      <g fill="var(--cactus-dark)" opacity="0.55">
        <circle cx="52" cy="70" r="1.6" />
        <circle cx="66" cy="80" r="1.6" />
        <circle cx="55" cy="94" r="1.6" />
        <circle cx="70" cy="100" r="1.6" />
        <circle cx="31" cy="50" r="1.4" />
        <circle cx="88" cy="48" r="1.4" />
      </g>
      <ellipse cx="26" cy="24" rx="7" ry="9" fill="var(--pear)" transform="rotate(-25 26 24)" />
      <ellipse cx="42" cy="22" rx="7" ry="9" fill="var(--pear)" />
      <ellipse cx="80" cy="22" rx="7" ry="9" fill="var(--pear)" transform="rotate(15 80 22)" />
      <ellipse cx="96" cy="28" rx="7" ry="9" fill="var(--pear)" transform="rotate(30 96 28)" />
      <ellipse cx="60" cy="46" rx="7" ry="9" fill="var(--pear)" />
    </svg>
  )
}
