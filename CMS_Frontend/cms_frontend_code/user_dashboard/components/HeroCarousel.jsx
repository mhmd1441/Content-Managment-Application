import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/user.css";
import slide1 from "@/assets/Book.png";
import slide2 from "@/assets/Prepaid.jpeg";
import slide3 from "@/assets/WebTalk.png";
import slide4 from "@/assets/WebTalk2.png";

export default function HeroCarousel({
  images = [],
  fit = "cover",            
  auto = true,              
  interval = 4500,          
  pauseOnHover = true,
}) {
  const srcs = images.length ? images : [slide1, slide2, slide3, slide4];
  const slides = srcs.filter(Boolean);
  const [i, setI] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const trackRef = useRef(null);
  const startX = useRef(0);
  const hasPointer = typeof window !== "undefined" && "PointerEvent" in window;

  if (!slides.length) return null;

  const prev = () => setI(p => (p - 1 + slides.length) % slides.length);
  const next = () => setI(p => (p + 1) % slides.length);
  const go = (idx) => setI(((idx % slides.length) + slides.length) % slides.length);

  useEffect(() => {
    if (!auto || paused) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [auto, paused, interval, slides.length]);

  const onPointerDown = (e) => {
    if (!hasPointer) return;
    startX.current = e.clientX;
    setDragging(true);
    setDragX(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    const threshold = Math.max(40, (trackRef.current?.clientWidth || 300) * 0.05);
    if (dragX > threshold) prev();
    else if (dragX < -threshold) next();
    setDragging(false);
    setDragX(0);
  };

  // keyboard
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const hoverProps = pauseOnHover
    ? {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
      }
    : {};

  return (
    <div
      className={`ud-carousel ${dragging ? "is-dragging" : ""}`}
      data-fit={fit}                  // CSS switches cover/contain
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero images"
      tabIndex={0}
      onKeyDown={onKeyDown}
      {...hoverProps}
    >
      <div
        ref={trackRef}
        className="ud-carousel-track"
        style={{
          transform: `translateX(calc(${-i * 100}% + ${dragX}px))`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {slides.map((src, idx) => (
          <div key={idx} className="ud-carousel-slide">
            <img
              src={src}
              alt={`slide ${idx + 1}`}
              loading={idx === i ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                console.warn(`Image failed to load: ${src}`);
                e.currentTarget.style.opacity = "0.3";
              }}
            />
          </div>
        ))}
      </div>

      <button className="ud-carousel-btn ud-prev" onClick={prev} aria-label="Previous">
        <ChevronLeft size={18} />
      </button>
      <button className="ud-carousel-btn ud-next" onClick={next} aria-label="Next">
        <ChevronRight size={18} />
      </button>

      <div className="ud-dots" role="tablist" aria-label="Slides">
        {slides.map((_, d) => (
          <button
            key={d}
            role="tab"
            aria-selected={d === i}
            aria-label={`Go to slide ${d + 1}`}
            className={`ud-dot ${d === i ? "active" : ""}`}
            onClick={() => go(d)}
          />
        ))}
      </div>
    </div>
  );
}
