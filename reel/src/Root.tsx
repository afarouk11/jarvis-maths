import "./index.css";
import { AbsoluteFill, Composition, useVideoConfig } from "remotion";
import { StudiQReel } from "./StudiQReel";

// Portrait reel scaled and centered inside a landscape canvas with branded side panels
const StudiQReelWide: React.FC = () => {
  const { width, height } = useVideoConfig();
  // Scale portrait 1080×1920 so its height fills 1080px
  const scale = height / 1920;
  const portraitW = Math.round(1080 * scale); // 607px
  const sideW = (width - portraitW) / 2;      // ~656px each side

  return (
    <AbsoluteFill style={{ background: "#060b16" }}>
      {/* Ambient glow background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(245,158,11,0.07), transparent)",
      }} />

      {/* Left side panel — brand info */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: sideW, height,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 24, padding: "0 40px",
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", letterSpacing: 2, textTransform: "uppercase" }}>StudiQ</div>
        <div style={{ fontSize: 18, color: "#5a7aaa", textAlign: "center", lineHeight: 1.6 }}>
          AI-powered revision<br />for A-level students
        </div>
        <div style={{ fontSize: 16, color: "#374151", textAlign: "center" }}>studiq.org</div>
      </div>

      {/* Centred portrait video */}
      <div style={{
        position: "absolute",
        left: sideW,
        top: 0,
        width: portraitW,
        height,
        overflow: "hidden",
      }}>
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: 1080,
          height: 1920,
        }}>
          <StudiQReel />
        </div>
      </div>

      {/* Right side panel — key stats */}
      <div style={{
        position: "absolute", right: 0, top: 0, width: sideW, height,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 20, padding: "0 40px",
      }}>
        {[
          { val: "64%", label: "miss target grade" },
          { val: "+34", label: "marks recovered" },
          { val: "Free", label: "to start" },
        ].map(({ val, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#f59e0b" }}>{val}</div>
            <div style={{ fontSize: 16, color: "#5a7aaa", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Thin separator lines */}
      <div style={{ position: "absolute", left: sideW - 1, top: 0, width: 1, height, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", left: sideW + portraitW, top: 0, width: 1, height, background: "rgba(255,255,255,0.06)" }} />
    </AbsoluteFill>
  );
};

// 30fps × 98s = 2940 frames — portrait 9:16 for Instagram Reels
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="StudiQReel"
      component={StudiQReel}
      durationInFrames={2940}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="StudiQReelWide"
      component={StudiQReelWide}
      durationInFrames={2940}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
