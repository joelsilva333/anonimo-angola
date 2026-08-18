import { NextRequest, NextResponse } from "next/server";

interface ProxyContext {
  params: Promise<{ path?: string[] }>;
}

async function handleProxy(request: NextRequest, context: ProxyContext) {
  const backendUrl = process.env.API_SECRET_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "URL do backend não configurada." },
      { status: 500 },
    );
  }

  const resolvedParams = await context.params;
  const pathSegment = resolvedParams.path ? resolvedParams.path.join("/") : "";

  const searchParams = new URL(request.url).search;
  const targetUrl = `${backendUrl}/api/${pathSegment}${searchParams}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  // O fetch server-side não propaga cookies para o backend.
  // Se o browser enviou um cookie aa_token, injectamo-lo como Authorization.
  const token = request.cookies.get("aa_token")?.value;
  if (token && !headers.has("authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const body = ["POST", "PUT", "PATCH"].includes(request.method)
      ? await request.text()
      : undefined;

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });

    let dataText = await backendResponse.text();

    if (
      backendResponse.headers.get("Content-Type")?.includes("application/json")
    ) {
      dataText = dataText.replaceAll(backendUrl, "");
    }

    return new NextResponse(dataText, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro de comunicação com o servidor proxy" },
      { status: 500 },
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};