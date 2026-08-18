import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://anonimo-angola.vercel.app/"),
	title: {
		default: "Anônimo Angola",
		template: "%s | Anônimo Angola",
	},
	description:
		"Anônimo Angola é a plataforma segura para desabafos anônimos, confidenciais e sem julgamentos em Angola. Compartilhe pensamentos, opiniões e experiências de forma totalmente privada.",
	keywords: [
		"Anônimo Angola",
		"desabafos anônimos Angola",
		"plataforma confidencial Angola",
		"desabafo online",
		"redes sociais anônimas",
		"confidencialidade online",
		"Joel Silva",
		"desenvolvedor Full Stack Angola",
		"desenvolvedor Frontend Angola",
		"Next.js Angola",
		"React Angola",
		"TypeScript Angola",
		"UI/UX designer Angola",
		"portfólio dev Angola",
	],
	authors: [{ name: "Joel Silva" }],
	creator: "Joel Silva",
	publisher: "Joel Silva",
	openGraph: {
		type: "website",
		locale: "pt_PT",
		url: "https://anonimo-angola.vercel.app/",
		title: "Anônimo Angola",
		description:
			"Anônimo Angola é a plataforma segura para desabafos anônimos, confidenciais e sem julgamentos em Angola.",
		siteName: "Anônimo Angola",
		images: [
			{
				url: "/logos/bg-white.png",
				width: 1200,
				height: 630,
				alt: "Prévia do Anônimo Angola",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Anônimo Angola",
		description:
			"Anônimo Angola é a plataforma segura para desabafos anônimos, confidenciais e sem julgamentos em Angola.",
		creator: "@JOELGERMANY4",
		images: ["/logos/bg-white.png"],
	},
	alternates: {
		canonical: "https://anonimo-angola.vercel.app/",
	},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
