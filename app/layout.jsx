import "./globals.css";

export const metadata = {
  title: "Polymath Mini · The Temperature Trap",
  description: "A tiny AI-assisted interactive lesson prototype for fundamental learning."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
