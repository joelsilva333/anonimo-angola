// app/posts/[postId]/page.tsx
import { Metadata } from "next";
import { PostInterface } from "@/app/interfaces/post";
import PostDetailPageClient from "./components/PostDetailPage";

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;

  const apiUrl = process.env.API_SECRET_URL || "http://localhost:8000/api";
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://anonimo-angola.vercel.app";

  try {
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Metadata fetch failed:", response.status, errorText);
      throw new Error("Failed to fetch post metadata");
    }

    const post: PostInterface = await response.json();

    const autor = post.anon_name || post.user?.anon_name || "Alguém";
    const title = `${autor} desabafou...`;

    const description =
      post.text.length > 140 ? `${post.text.substring(0, 137)}...` : post.text;

    const shareUrl = `${baseUrl}/post/${postId}`;
    const imageOgUrl = `${baseUrl}/logos/bg-white.png`;

    return {
      metadataBase: new URL(baseUrl),
      title: title,
      description: description,
      keywords: [
        "Anônimo Angola",
        "desabafos anônimos Angola",
        "plataforma confidencial Angola",
        "desabafo online",
        "redes sociais anônimas",
        "confidencialidade online",
      ],
      alternates: {
        canonical: shareUrl,
      },
      openGraph: {
        type: "article",
        url: shareUrl,
        title: `${title} | Anônimo Angola`,
        description: description,
        siteName: "Anônimo Angola",
        locale: "pt_AO",
        images: [
          {
            url: imageOgUrl,
            width: 1200,
            height: 630,
            alt: `Desabafo de ${autor} no Anônimo Angola`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Anônimo Angola`,
        description: description,
        images: [imageOgUrl],
      },

      other: {
        "og:image:secure_url": imageOgUrl,
        "og:image:type": "image/png",
      },
    };
  } catch (error) {
    console.error("Erro ao buscar o desabafo:", error);

    return {
      title: "Desabafo Não Encontrado",
      description:
        "O desabafo que procura não foi encontrado ou foi removido de forma confidencial.",
      openGraph: {
        title: "Desabafo Não Encontrado | Anônimo Angola",
        description:
          "O desabafo que procura não foi encontrado ou foi removido de forma confidencial.",
        images: [
          {
            url: `${baseUrl}/logos/bg-white.png`,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params;

  return <PostDetailPageClient postId={postId} />;
}
