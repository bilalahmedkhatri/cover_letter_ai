/** Decorative layers only: no image downloads, canvas or animation runtime. */
export default function LandingDepth({ variant = 'sheets' }: { variant?: 'sheets' | 'orbit' | 'frames' }) {
  return <svg className={`landing-depth landing-depth--${variant}`} viewBox="0 0 240 240" fill="none" aria-hidden="true" focusable="false">
    <circle cx="126" cy="108" r="88" fill="currentColor" fillOpacity="0.08" />
    <g stroke="currentColor" strokeWidth="1">
      {[0, 1, 2, 3, 4].map(layer => variant === 'orbit'
        ? <ellipse key={layer} cx={100 + layer * 12} cy={142 - layer * 15} rx="49" ry="61" transform={`rotate(-32 ${100 + layer * 12} ${142 - layer * 15})`} opacity={0.12 + layer * 0.12} />
        : <rect key={layer} x={42 + layer * 12} y={80 - layer * 12} width={variant === 'sheets' ? 93 : 82} height={variant === 'sheets' ? 120 : 82}
          rx={variant === 'sheets' ? 7 : 3} transform={`rotate(${variant === 'sheets' ? -28 + layer * 4 : -30 + layer * 9} 120 120)`} opacity={0.12 + layer * 0.12} />)}
    </g>
  </svg>;
}
