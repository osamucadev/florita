import "./globals.css";

export const metadata = {
  title: "Florita",
  description: "Seu dicionário inteligente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
