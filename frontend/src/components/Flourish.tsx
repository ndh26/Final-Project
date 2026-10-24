/** Gold divider in the style of the business card's flourishes. */
export default function Flourish({ className = 'flourish' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 24" aria-hidden="true">
      <g fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 12h72" />
        <path d="M164 12h72" />
        <path d="M80 12c10 0 14-8 22-8 6 0 8 6 3 8-4 2-7-2-4-4" />
        <path d="M160 12c-10 0-14-8-22-8-6 0-8 6-3 8 4 2 7-2 4-4" />
        <path d="M86 15c10 0 16 5 24 5" />
        <path d="M154 15c-10 0-16 5-24 5" />
      </g>
      <path d="M120 2c3 5 6 7 6 10s-3 5-6 10c-3-5-6-7-6-10s3-5 6-10z" fill="var(--gold)" />
    </svg>
  )
}
