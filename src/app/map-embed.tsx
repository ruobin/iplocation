const DELTA = 0.08;

export function MapEmbed({ lat, lon }: { lat: number; lon: number }) {
  const bbox = `${lon - DELTA},${lat - DELTA},${lon + DELTA},${lat + DELTA}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
      <iframe
        src={src}
        width="100%"
        height="300"
        title={`Map for ${lat.toFixed(4)}, ${lon.toFixed(4)}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="block w-full"
        style={{ border: 0 }}
      />
      <div className="flex items-center justify-end border-t border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
        >
          View on OpenStreetMap ↗
        </a>
      </div>
    </div>
  );
}
