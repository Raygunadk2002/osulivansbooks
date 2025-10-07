import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O'Sullivan House",
  description: "Shared holiday home booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}