// app/posts/[postId]/page.tsx
import { Metadata } from "next";
import { PostInterface } from "@/app/interfaces/post"; 
import PostDetailPageClient from "./components/PostDetailPage";

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://anonimo-angola.vercel.app";

  try {
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
      next: { revalidate: 30 }, // Mantém o cache por 30 segundos
    });

    if (!response.ok) throw new Error();
    
    const post: PostInterface = await response.json();

    const autor = post.anon_name || post.user?.anon_name || "Alguém";
    const title = `${autor} desabafou...`;
    
    const description = post.text.length > 150 
      ? `${post.text.substring(0, 150)}...` 
      : post.text;

    return {
      title: title,
      description: description,
      openGraph: {
        type: "article",
        url: `${baseUrl}/posts/${postId}`,
        title: `${title} | Anônimo Angola`,
        description: description,
        images: [
          {
            url: `${baseUrl}/logos/bg-white.png`, 
            width: 1200,
            height: 630,
            alt: `Desabafo de ${autor}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Anônimo Angola`,
        description: description,
        images: [`${baseUrl}/logos/bg-white.png`],
      },
    };
  } catch (error) {

    return {
      title: "Desabafo Anónimo | Anônimo Angola",
      description: "Lê e partilha desabafos de forma totalmente anónima.",
    };
  }
}

export default async function Page({ params }: Props) {
  return <PostDetailPageClient params={params} />;
}