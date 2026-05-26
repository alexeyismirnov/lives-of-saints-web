export function OrnamentalRule({ className = "" }: { className?: string }) {
  return (
    <div className={`ornamental-rule ${className}`.trim()} aria-hidden>
      <span className="ornamental-rule-line" />
      <span className="ornamental-rule-gem">✦</span>
      <span className="ornamental-rule-line" />
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <header className={`page-heading mb-8 ${alignClass}`}>
      <OrnamentalRule className={align === "left" ? "max-w-xs" : "mb-4"} />
      <h1 className="font-display text-4xl font-semibold leading-tight text-wine-900 md:text-[2.75rem]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.25em] text-gold-700">
          {subtitle}
        </p>
      )}
      {align === "center" && <OrnamentalRule className="mt-5" />}
    </header>
  );
}

export function DayHeading({ label }: { label: string }) {
  return (
    <h2 className="day-heading mb-3 flex items-center gap-3 font-display text-xl font-semibold text-wine-800">
      <span className="text-gold-600" aria-hidden>
        ✦
      </span>
      <span>{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-gold-500/50 to-transparent" />
    </h2>
  );
}
