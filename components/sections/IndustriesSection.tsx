import SectionLabel from "@/components/ui/SectionLabel";

type Dict = { label: string; title: string; items: string[] };

function Row({ words, shift }: { words: string[]; shift: "left" | "right" }) {
  // Duplicated so a long line always overflows the viewport while drifting.
  const line = [...words, ...words];
  return (
    <div className="overflow-hidden py-1" aria-hidden="true">
      <div className="industry-row flex gap-10" data-shift={shift}>
        {line.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="outline-word text-[11vw] sm:text-[8vw]"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function IndustriesSection({ dict }: { dict: Dict }) {
  const mid = Math.ceil(dict.items.length / 2);
  const top = dict.items.slice(0, mid);
  const bottom = dict.items.slice(mid);

  return (
    <section
      className="relative flex min-h-[140vh] flex-col justify-center overflow-hidden py-28"
      data-band="industries"
    >
      <div className="section-pad mb-14 flex flex-col items-center text-center">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2 className="display mt-6 text-4xl sm:text-6xl" data-reveal="up">
          {dict.title}
        </h2>
      </div>

      <Row words={top} shift="left" />
      <Row words={bottom} shift="right" />

      {/* Screen-reader friendly list of the same content. */}
      <ul className="sr-only">
        {dict.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
