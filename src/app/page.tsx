import EyeLogo from "@/components/Icons/EyeLogo";
import ButtonDefault from "@/components/Button/ButtonDefault";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_45%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <EyeLogo animate className="mb-10 h-16 w-16 text-foreground/90" />

        <div
          className="animate-fade-up space-y-4 [animation-delay:1.2s] [animation-fill-mode:both]"
        >
          <h1 className="text-4xl font-light tracking-[0.5em] text-foreground sm:text-5xl">
            DRAXIS
          </h1>
          <p className="text-sm tracking-[0.35em] text-muted-foreground">
            Observe. Infer. Decide.
          </p>
        </div>

        <section
          className="mt-24 max-w-xl space-y-6 animate-fade-up [animation-delay:1.6s] [animation-fill-mode:both]"
        >
          <p className="text-lg font-light leading-relaxed text-muted-foreground">
            Most companies collect data.
          </p>
          <p className="text-lg font-light leading-relaxed text-foreground">
            We reveal what it means.
          </p>
        </section>

        <section
          className="mt-24 max-w-md space-y-3 animate-fade-up [animation-delay:2s] [animation-fill-mode:both]"
        >
          <p className="text-sm text-muted-foreground">
            Trusted where certainty matters.
          </p>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </section>

        <div className="mt-16 animate-fade-up [animation-delay:2.4s] [animation-fill-mode:both]">
          <ButtonDefault href="/platform" variant="outline" size="lg">
            Request Access
          </ButtonDefault>
        </div>
      </main>
    </div>
  );
}
