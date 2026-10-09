import { Megaphone, PenTool, Search, TrendingUp } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

type Step = { n: string; title: string; desc: string };

const STEP_ICONS = [Search, PenTool, Megaphone, TrendingUp];

type Dict = {
  label: string;
  title: string;
  steps: Step[];
};

export default function ProcessSection({ dict }: { dict: Dict }) {
  return (
    <section
      className="section-pad relative flex min-h-[170vh] flex-col justify-center py-28"
      data-band="process"
    >
      <div className="mb-16 max-w-3xl self-center text-center">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2 className="display mt-6 text-4xl sm:text-6xl" data-reveal="up">
          {dict.title}
        </h2>
      </div>

      <ol className="grid gap-px border border-line bg-line sm:grid-cols-2">
        {dict.steps.map((step, i) => {
          const Icon = STEP_ICONS[i % STEP_ICONS.length];
          return (
            <li
              key={step.n}
              className="flex flex-col gap-4 bg-ink p-8 sm:p-12"
              data-rush={i % 2 === 0 ? "left" : "right"}
            >
              <div className="flex items-center justify-between">
                <span className="display text-4xl text-accent sm:text-5xl">
                  {step.n}
                </span>
                <Icon size={20} className="text-mist/70" aria-hidden="true" />
              </div>
              <h3 className="display text-2xl sm:text-3xl">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-mist">
                {step.desc}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
