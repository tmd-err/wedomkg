type Props = { children: React.ReactNode };

export default function SectionLabel({ children }: Props) {
  return (
    <p className="kicker flex items-center gap-3" data-reveal>
      <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}
