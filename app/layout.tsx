import type { ReactNode } from "react";

export const metadata = {
  title: "Ferretería Dominicana",
  description: "Sistema de inventario, compras y ventas",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
