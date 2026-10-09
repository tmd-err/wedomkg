import { Mail, Send } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import MagneticButton from "@/components/ui/MagneticButton";

type Dict = {
  label: string;
  title: string;
  titleLine2: string;
  body: string;
  cta: string;
};

export default function ContactSection({
  dict,
  email,
}: {
  dict: Dict;
  email: string;
}) {
  return (
    <section
      id="contact"
      className="section-pad relative flex min-h-[110vh] flex-col items-center justify-center py-28 text-center"
      data-band="contact"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 46% at 50% 50%, rgba(10,9,8,0.82) 0%, rgba(10,9,8,0.42) 55%, transparent 78%)",
        }}
      />
      <div className="relative flex flex-col items-center">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2
          className="display mt-8 text-[11vw] leading-[0.95] sm:text-[8vw]"
          data-reveal="up"
        >
          {dict.title}
          <br />
          <span className="text-accent">{dict.titleLine2}</span>
        </h2>
        <p
          className="mt-8 max-w-md text-base leading-relaxed text-mist sm:text-lg"
          data-reveal="up"
        >
          {dict.body}
        </p>
        <div className="mt-12 flex flex-col items-center gap-6" data-reveal="up">
          <MagneticButton
            href={`mailto:${email}`}
            label={dict.cta}
            icon={<Send size={14} aria-hidden="true" />}
          />
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-paper underline decoration-line underline-offset-8 transition-colors hover:text-accent"
          >
            <Mail size={14} className="text-accent" aria-hidden="true" />
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
