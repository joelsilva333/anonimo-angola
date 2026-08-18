export default function Footer() {
  return (
    <footer
      className="w-full px-8 py-6 text-center"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.30)",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "rgba(30,30,30,0.52)", fontWeight: 400, letterSpacing: "0.01em" }}
        >
          © {new Date().getFullYear()} Anônimo Angola. Todos os direitos reservados à{" "}
          <span style={{ fontWeight: 600, color: "rgba(30,30,30,0.72)" }}>Joel Silva</span>.
        </p>
      </div>
    </footer>
  );
}
