import { ArrowDown, MessageCircle } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrollIndicator from "@/components/ui/ScrollIndicator";

type Dict = {
  kicker: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scroll: string;
};

export default function HeroSection({ dict }: { dict: Dict }) {
  return (
    <section
      id="top"
      className="section-pad relative flex min-h-[100svh] flex-col items-center justify-center text-center"
      aria-label="We Do Marketing"
      data-band="hero"
    >
      <p className="kicker mb-6" data-reveal="up">
        {dict.kicker}
      </p>
      <h1
        className="display max-w-[16ch] text-[13vw] leading-[0.92] sm:text-[10vw] lg:text-[8.5vw]"
        data-reveal="up"
      >
        {dict.title}
      </h1>
      <p
        className="mt-7 max-w-md text-base leading-relaxed text-mist sm:text-lg"
        data-reveal="up"
      >
        {dict.subtitle}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4" data-reveal="up">
        <MagneticButton
          href="#contact"
          label={dict.ctaPrimary}
          icon={<MessageCircle size={14} aria-hidden="true" />}
        />
        <MagneticButton
          href="#works"
          label={dict.ctaSecondary}
          variant="ghost"
          icon={<ArrowDown size={14} aria-hidden="true" />}
        />
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ScrollIndicator label={dict.scroll} />
      </div>
    </section>
  );
}
