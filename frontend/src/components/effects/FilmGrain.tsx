import { useEffect, useRef } from "react";

const GRAIN_SIZE = 150;

function generateNoiseFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

const FilmGrain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = GRAIN_SIZE;
    canvas.height = GRAIN_SIZE;

    let raf: number;

    const loop = () => {
      generateNoiseFrame(ctx, GRAIN_SIZE, GRAIN_SIZE);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ opacity: 0.04 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

export default FilmGrain;
