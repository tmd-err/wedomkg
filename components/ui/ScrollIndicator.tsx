type Props = { label: string };

export default function ScrollIndicator({ label }: Props) {
  return (
    <span className="scroll-hint" aria-hidden="true">
      <span className="kicker">{label}</span>
      <span className="track">
        <span />
      </span>
    </span>
  );
}
