export function AudioPlayer({ url, title }: { url: string; title?: string }) {
  return (
    <div className="my-8 rounded-sm border border-gold-600/25 bg-parchment-100/80 px-5 py-4">
      {title && (
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-gold-700">
          {title}
        </p>
      )}
      <audio controls className="w-full accent-wine-800" preload="metadata">
        <source src={url} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
