import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Proxy de streaming: encaminha o pedido para POST /api/support/chat no
 * backend Express e devolve a resposta em streaming directamente ao cliente.
 *
 * O token JWT está no cookie `aa_token` (definido pelo browser).
 * O fetch server-side não propaga cookies automaticamente para o backend,
 * por isso lemos o cookie aqui e injectamo-lo como Authorization header.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.API_SECRET_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "URL do backend não configurada." },
      { status: 500 },
    );
  }

  // Ler o token JWT do cookie e injectá-lo como Authorization header
  const token = request.cookies.get("aa_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "É necessário estar autenticado para usar o apoio emocional." },
      { status: 401 },
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Corpo do pedido inválido." },
      { status: 400 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${backendUrl}/api/support/chat`, {
      method: "POST",
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível contactar o servidor de apoio emocional." },
      { status: 502 },
    );
  }

  if (!backendResponse.ok || !backendResponse.body) {
    const errorText = await backendResponse.text().catch(() => "");
    let errorMessage = "Erro ao contactar o apoio emocional.";
    try {
      errorMessage = JSON.parse(errorText)?.error ?? errorMessage;
    } catch {}
    return NextResponse.json(
      { error: errorMessage },
      { status: backendResponse.status },
    );
  }

  return new NextResponse(backendResponse.body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
