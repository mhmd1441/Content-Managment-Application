import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/user.css";
import slide1 from "@/assets/Book.png";
import slide2 from "@/assets/Prepaid.jpeg";
import slide3 from "@/assets/WebTalk.png";
import slide4 from "@/assets/WebTalk2.png";

export default function HeroCarousel({ images = [] }) {
  const srcs = images.length ? images : [slide1, slide2, slide3, slide4];

  const slides = useMemo(() => srcs.filter(Boolean).slice(0, 4), [srcs]);
  const [i, setI] = useState(0);
  if (!slides.length) return null;

  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setI((p) => (p + 1) % slides.length);

  return (
    <div className="ud-carousel">
      <div
        className="ud-carousel-track"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((src, idx) => (
          <div key={idx} className="ud-carousel-slide">
            <img
              src={src}
              alt={`slide-${idx + 1}`}
              onError={(e) => {
                console.warn(`Image failed to load: ${src}`);
                e.currentTarget.src = "/fallback.jpg";
              }}
            />
          </div>
        ))}
      </div>
      <button
        className="ud-carousel-btn ud-prev"
        onClick={prev}
        aria-label="Prev"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        className="ud-carousel-btn ud-next" 
        onClick={next}
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>
      <div className="ud-dots">
        {slides.map((_, d) => (
          <span key={d} className={`ud-dot ${d === i ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
