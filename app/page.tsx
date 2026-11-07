"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  unidad: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  url && key ? createClient(url, key) : null;

const opciones = [
  "Productos",
  "Compras",
  "Ventas",
  "Control de stock",
  "Empleados",
  "Reportes",
];

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (seccion !== "Productos") return;

    async function cargarProductos() {
      setCargando(true);
      setError("");

      if (!supabase) {
        setError("Falta configurar Supabase.");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre");

      if (error) {
        setError(error.message);
      } else {
        setProductos(data || []);
      }

      setCargando(false);
    }

    cargarProductos();
  }, [seccion]);

  const gs = (valor: number) =>
    Number(valor).toLocaleString("es-PY") + " Gs.";

  return (
    <main style={{
      padding: 24,
      fontFamily: "Arial, sans-serif",
      maxWidth: 1000,
      margin: "auto"
    }}>
      <h1>Ferretería Dominicana</h1>
      <h2>Sistema de Gestión</h2>
      <p>Moneda: Guaraníes (Gs.)</p>

      <h3>Menú principal</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12
      }}>
        {opciones.map((opcion) => (
          <button
            key={opcion}
            onClick={() => setSeccion(opcion)}
            style={{
              background: "#078344",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 20,
              fontSize: 17,
              cursor: "pointer"
            }}
          >
            {opcion}
          </button>
        ))}
      </div>

      <section style={{ marginTop: 30 }}>
        <h2>{seccion}</h2>

        {seccion === "Inicio" && (
          <p>Bienvenido al sistema.</p>
        )}

        {seccion === "Productos" && (
          <>
            {cargando && <p>Cargando productos...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!cargando && !error && (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr>
                      {["Código", "Producto", "Compra",
                        "Venta", "Stock", "Unidad"].map(
                        (titulo) => (
                          <th key={titulo} style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            textAlign: "left"
                          }}>
                            {titulo}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.codigo}</td>
                        <td>{p.nombre}</td>
                        <td>{gs(p.precio_compra)}</td>
                        <td>{gs(p.precio_venta)}</td>
                        <td>{p.stock}</td>
                        <td>{p.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productos.length === 0 && (
                  <p>No hay productos disponibles.</p>
                )}
              </div>
            )}
          </>
        )}

        {seccion !== "Inicio" &&
          seccion !== "Productos" && (
            <p>Próximamente configuraremos {seccion}.</p>
          )}
      </section>
    </main>
  );
}
