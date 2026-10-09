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
      className="section-pad relative flex min-h-[330vh] flex-col justify-center py-28"
      data-band="process"
    >
      <div className="mb-[14vh] max-w-3xl self-center text-center">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2 className="display mt-6 text-4xl sm:text-6xl" data-reveal="up">
          {dict.title}
        </h2>
      </div>

      {/* Tall editorial rows — scroll position maps each stage to a phase
          of the golden signal in the scene (data-focus="process"). */}
      <ol className="flex flex-col gap-[26vh]" data-focus="process">
        {dict.steps.map((step, i) => {
          const Icon = STEP_ICONS[i % STEP_ICONS.length];
          return (
            <li
              key={step.n}
              data-focus-row
              className="flex min-h-[42vh] items-center"
            >
              <div
                className={`max-w-xl ${
                  i % 2 === 0 ? "" : "sm:ml-auto sm:text-right"
                }`}
                data-reveal={i % 2 === 0 ? "left" : "right"}
              >
                <div
                  className={`flex items-center gap-5 ${
                    i % 2 === 0 ? "" : "sm:flex-row-reverse"
                  }`}
                >
                  <span className="display text-5xl text-accent sm:text-6xl">
                    {step.n}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-line text-mist/70">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="display mt-5 text-3xl sm:text-5xl">
                  {step.title}
                </h3>
                <p
                  className={`mt-5 max-w-md text-sm leading-relaxed text-mist sm:text-base ${
                    i % 2 === 0 ? "" : "sm:ml-auto"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
