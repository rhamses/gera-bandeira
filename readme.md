![Gera Bandeira](./assets/readme.gif)

## 🇧🇷 Gerador de bandeira

Uma forma simples de gerar o seu próprio lema da bandeira e compartilhar por aí! **[Acesse aqui](https://amb1.io/gera-bandeira/)**

É possível interagir via twitter com o robô [@lemadobrasil](https://twitter.com/lemadobrasil) mandando a sua sugestão seguindo os gatilhos e [explicados aqui](https://twitter.com/lemadobrasil/status/1523895283876257798)

## 🥞 Stack

- site feito apenas com html e o poder da Canvas API
- apis feito com Node.js
- CloudFlare Pages Worker

## ☁️ Upload de imagem (Cloudflare Pages + R2)

- Crie um bucket R2 e deixe-o público via domínio próprio ou URL pública da Cloudflare.
- No projeto Pages, adicione um binding R2 chamado `BANDEIRAS` apontando para esse bucket.
- Defina a variável `PUBLIC_R2_BASE_URL` (ex.: `https://cdn.seu-dominio.com`) no ambiente do Pages e, para desenvolvimento local, copie `.env.example` para `.dev.vars` com o mesmo valor.
- Para desenvolver localmente com `wrangler pages dev`, ajuste `wrangler.toml` com o nome do seu bucket em `bucket_name` e tenha o binding `BANDEIRAS`.
- A função edge está em `functions/api/upload-image.js` e é chamada pelo front em `/api/upload-image`.
- O botão “Compartilhar” do `index.html` rasteriza o SVG e copia a imagem (PNG) diretamente para a área de transferência; se o navegador não suportar copiar imagens, ele baixa o arquivo.

---

## 🇺🇸 Brazilian Flag Generator

A simple way to generate your own brazilian flag motto and share it. **[Try it here](https://amb1.io/gera-bandeira/)**

You can also interact on Twitter with the bot [@lemadobrasil](https://twitter.com/lemadobrasil) by sending your suggestion following the triggers [explained here](https://twitter.com/lemadobrasil/status/1523895283876257798).

## 🥞 Stack

- site built only with HTML and the Canvas API
- APIs built with Node.js
- CloudFlare Pages Worker

## ☁️ Image upload (Cloudflare Pages + R2)

- Create an R2 bucket and make it public via your own domain or a public Cloudflare URL.
- In the Pages project, add an R2 binding named `BANDEIRAS` pointing to that bucket.
- Set the `PUBLIC_R2_BASE_URL` variable (e.g., `https://cdn.your-domain.com`) in the Pages environment, and for local development copy `.env.example` to `.dev.vars` with the same value.
- For local development with `wrangler pages dev`, set `bucket_name` in `wrangler.toml` to your bucket name and ensure the `BANDEIRAS` binding exists.
- The edge function lives at `functions/api/upload-image.js` and is called by the front end at `/api/upload-image`.
- The “Compartilhar” button in `index.html` rasterizes the SVG and copies the image (PNG) directly to the clipboard; if the browser cannot copy images, it downloads the file instead.

---

## 🎬 Vídeo / Video

![Prévia do gerador](./readme-movie.gif)
