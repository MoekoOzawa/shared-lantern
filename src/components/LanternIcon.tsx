import lantern from "/src/assets/lantern.png";

export default function LanternIcon({ width = 22 }) {
  return (
    <img
      src={lantern}
      alt="lantern"
      style={{
        width,
        height: "auto",
        animation: "lanternFlicker 2.2s infinite ease-in-out",
        transformOrigin: "50% 80%",
        pointerEvents: "none",
      }}
    />
  );
}
