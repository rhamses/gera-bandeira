export async function onRequestPost({ request, env }) {
  if (!env.BANDEIRAS) {
    return new Response(
      JSON.stringify({ error: "R2 binding BANDEIRAS não configurado" }),
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
    });
  }

  if (!payload.image || typeof payload.image !== "string") {
    return new Response(JSON.stringify({ error: "Faltou image (data URL)" }), {
      status: 400,
    });
  }

  const base64 = payload.image.split(",")[1];
  if (!base64) {
    return new Response(JSON.stringify({ error: "Formato de data URL inválido" }), {
      status: 400,
    });
  }

  try {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const key = `bandeira-${Date.now()}-${crypto.randomUUID()}.png`;

    await env.BANDEIRAS.put(key, binary, {
      httpMetadata: { contentType: "image/png" },
    });

    const base = (env.PUBLIC_R2_BASE_URL || "").replace(/\/$/, "");
    const imageUrl = base ? `${base}/${key}` : key;

    return new Response(JSON.stringify({ imageUrl, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao salvar no R2", error);
    return new Response(JSON.stringify({ error: "Erro ao salvar no R2" }), {
      status: 500,
    });
  }
}
