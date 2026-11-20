const TEAM = [
  {
    name: "Hanif Ilham Athaurrahman",
    role: "Backend Developer",
    github: "https://github.com/athaurian",
  },
  {
    name: "Salva Faddil Rinaldi",
    role: "Frontend Developer",
    github: "https://github.com/salvafaddil",
  },
  {
    name: "Ilham Ligar Samudra",
    role: "Frontend Developer",
    github: "https://github.com/Ilham12359",
  },
];

export default function About() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: "1.75rem" }}>About 404 Found</h1>
      <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: 32 }}>
        404 Found is a Lost &amp; Found web application for Fasilkom UI
        students, built for RISTEK Open Class Web Development 2026 to connect
        students who lost their belongings with those who found them.
      </p>

      <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Team</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {TEAM.map((member) => (
          <div
            key={member.github}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem" }}>
              {member.name}
            </h3>
            <p style={{ margin: "0 0 12px", fontSize: "0.825rem", color: "#6b7280" }}>
              {member.role}
            </p>
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "0.825rem", fontWeight: 500 }}
            >
              GitHub Profile
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
