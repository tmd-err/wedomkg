import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#0a0908",
          color: "#f4efe4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ letterSpacing: "0.3em", fontSize: "0.75rem", color: "#9a937f" }}>
          WE DO MARKETING — 404
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          This page drifted off the map.
        </h1>
        <Link href="/en" style={{ color: "#f5a81c" }}>
          Back to home
        </Link>
      </body>
    </html>
  );
}
