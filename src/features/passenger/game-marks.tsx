type HoneycombMarkProps = {
  className?: string;
};

export function HoneycombMark({ className }: HoneycombMarkProps) {
  return (
    <span className={`passenger-honeycomb-mark ${className ?? ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
