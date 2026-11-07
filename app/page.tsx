"use client";

import { useState } from "react";

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");

  const opciones = [
    "Productos",
    "Compras",
    "Ventas",
    "Control de stock",
    "Empleados",
    "Reportes",
  ];

  return (
    <main style={{
      padding: 24,
      fontFamily: "Arial, sans-serif",
      maxWidth: 900,
      margin: "auto",
    }}>
      <h1>Ferretería Dominicana</h1>
      <h2>Sistema de Gestión</h2>
      <p>Moneda: Guaraníes (Gs.)</p>

      <h3>Menú principal</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}>
        {opciones.map((opcion) => (
          <button
            key={opcion}
            onClick={() => setSeccion(opcion)}
            style={{
              padding: 20,
              backgroundColor: "#176b45",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 17,
              cursor: "pointer",
            }}
          >
            {opcion}
          </button>
        ))}
      </div>

      <section style={{ marginTop: 30 }}>
        <h2>{seccion}</h2>
        <p>
          {seccion === "Inicio"
            ? "Bienvenido al sistema."
            : `Próximamente configuraremos ${seccion}.`}
        </p>
      </section>
    </main>
  );
}
