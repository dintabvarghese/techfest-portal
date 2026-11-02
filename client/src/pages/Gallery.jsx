import React from 'react';

const COUNT = 8;

export default function Gallery() {
  return (
    <section>
      <h2>Gallery</h2>
      <div className="grid">
        {Array.from({ length: COUNT }, (_, i) => (
          <img
            key={i}
            src={`/gallery/photo${i + 1}.svg`}
            alt={`TechFest 2026 event photo ${i + 1}`}
            width="400"
            height="260"
            loading="lazy"   // Step 16: image downloads only when it scrolls into view
          />
        ))}
      </div>
    </section>
  );
}
