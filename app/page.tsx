"use client";

import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

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
const supabase = url && key ? createClient(url, key) : null;
const opciones = ["Productos", "Compras", "Ventas", "Control de stock", "Empleados", "Reportes"];

export default function Home() {
  const [seccion, setSeccion] = useState("Inicio");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [recuperando, setRecuperando] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setVerificando(false);
      return;
    }
    const cliente = supabase;
    let activo = true;
    cliente.auth.getSession().then(({ data, error }) => {
      if (!activo) return;
      if (error) setMensaje(error.message);
      setSesion(data.session);
      setVerificando(false);
    });
    const { data: { subscription } } = cliente.auth.onAuthStateChange((evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      setVerificando(false);
      if (evento === "PASSWORD_RECOVERY") {
        setRecuperando(true);
        setMensaje("Ingresá tu nueva contraseña para guardarla.");
      }
    });
    return () => { activo = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sesion || seccion !== "Productos" || !supabase) return;
    const cliente = supabase;
    let activo = true;
    async function cargarProductos() {
      setCargando(true);
      setError("");
      const { data, error: fallo } = await cliente.from("productos").select("*").order("nombre");
      if (!activo) return;
      if (fallo) setError(fallo.message);
      else setProductos(data || []);
      setCargando(false);
    }
    void cargarProductos();
    return () => { activo = false; };
  }, [sesion, seccion]);

  async function ingresar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setProcesando(true);
    setMensaje("");
    const { error: fallo } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: contrasena });
    setMensaje(fallo ? fallo.message : "Sesión iniciada correctamente.");
    setContrasena("");
    setProcesando(false);
  }

  async function enviarRecuperacion() {
    if (!supabase || !correo.trim()) {
      setMensaje("Escribí tu correo electrónico primero.");
      return;
    }
    setProcesando(true);
    const { error: fallo } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}/`,
    });
    setMensaje(fallo ? fallo.message : "Si el correo está registrado, recibirás un enlace para cambiar la contraseña.");
    setProcesando(false);
  }

  async function guardarContrasena(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setProcesando(true);
    const { error: fallo } = await supabase.auth.updateUser({ password: contrasena });
    if (fallo) setMensaje(fallo.message);
    else {
      setRecuperando(false);
      setMensaje("Contraseña actualizada. Ya podés usar el sistema.");
      setContrasena("");
      window.history.replaceState({}, "", window.location.pathname);
    }
    setProcesando(false);
  }

  async function salir() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSeccion("Inicio");
    setProductos([]);
    setMensaje("");
  }

  const gs = (valor: number) => Number(valor).toLocaleString("es-PY") + " Gs.";
  const campo: React.CSSProperties = { display: "block", width: "100%", maxWidth: 400, padding: 12, margin: "8px 0 16px", border: "1px solid #bbb", borderRadius: 6 };
  const boton: React.CSSProperties = { background: "#078344", color: "white", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 16, cursor: "pointer" };

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 1000, margin: "auto" }}>
      <h1>Ferretería Dominicana</h1>
      <h2>Sistema de Gestión</h2>
      <p>Moneda: Guaraníes (Gs.)</p>
      {!supabase && <p style={{ color: "red" }}>Falta configurar las variables públicas de Supabase en Vercel.</p>}
      {verificando ? <p>Verificando sesión...</p> : recuperando ? (
        <form onSubmit={guardarContrasena}>
          <h3>Crear nueva contraseña</h3>
          <label htmlFor="nueva">Nueva contraseña</label>
          <input id="nueva" type="password" minLength={8} required value={contrasena} onChange={(e) => setContrasena(e.target.value)} style={campo} autoComplete="new-password" />
          <button type="submit" disabled={procesando || !supabase} style={boton}>Guardar contraseña</button>
        </form>
      ) : !sesion ? (
        <form onSubmit={ingresar}>
          <h3>Iniciar sesión</h3>
          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} style={campo} autoComplete="username" />
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} style={campo} autoComplete="current-password" />
          <button type="submit" disabled={procesando || !supabase} style={boton}>Ingresar</button>
          <p><button type="button" onClick={enviarRecuperacion} disabled={procesando || !supabase} style={{ background: "none", border: "none", color: "#075caa", textDecoration: "underline", cursor: "pointer", padding: 0 }}>Olvidé mi contraseña</button></p>
        </form>
      ) : (
        <>
          <p>Sesión: {sesion.user.email} <button type="button" onClick={salir} style={{ marginLeft: 12 }}>Cerrar sesión</button></p>
          <h3>Menú principal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {opciones.map((opcion) => (
              <button key={opcion} onClick={() => setSeccion(opcion)} style={{ ...boton, padding: 20, fontSize: 17 }}>{opcion}</button>
            ))}
          </div>
          <section style={{ marginTop: 30 }}>
            <h2>{seccion}</h2>
            {seccion === "Inicio" && <p>Bienvenido al sistema.</p>}
            {seccion === "Productos" && (
              <>
                {cargando && <p>Cargando productos...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!cargando && !error && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>{["Código", "Producto", "Compra", "Venta", "Stock", "Unidad"].map((titulo) => <th key={titulo} style={{ border: "1px solid #ccc", padding: 10, textAlign: "left" }}>{titulo}</th>)}</tr></thead>
                      <tbody>{productos.map((p) => <tr key={p.id}>{[p.codigo, p.nombre, gs(p.precio_compra), gs(p.precio_venta), p.stock, p.unidad].map((valor, i) => <td key={i} style={{ border: "1px solid #ccc", padding: 10 }}>{valor}</td>)}</tr>)}</tbody>
                    </table>
                    {productos.length === 0 && <p>No hay productos disponibles. Revisaremos las políticas de acceso si esperabas ver productos.</p>}
                  </div>
                )}
              </>
            )}
            {seccion !== "Inicio" && seccion !== "Productos" && <p>Próximamente configuraremos {seccion}.</p>}
          </section>
        </>
      )}
      {mensaje && <p role="status" style={{ marginTop: 16 }}>{mensaje}</p>}
    </main>
  );
}
