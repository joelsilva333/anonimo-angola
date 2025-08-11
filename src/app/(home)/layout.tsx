import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anônimo Angola",
  description: "Uma plataforma para desabafos anônimos em Angola",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>Header</h1>
      {children}
      <h1>Footer</h1>
    </div>
  );
}
