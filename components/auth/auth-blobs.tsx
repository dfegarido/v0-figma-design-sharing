export function AuthBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          top: -50,
          left: -50,
          backgroundColor: "#FF5A5F",
          opacity: 0.05,
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: 180,
          left: 220,
          backgroundColor: "#FFB4A2",
          opacity: 0.06,
          filter: "blur(35px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 160,
          top: 480,
          left: -30,
          backgroundColor: "#E76F61",
          opacity: 0.04,
          filter: "blur(30px)",
        }}
      />
    </div>
  )
}
