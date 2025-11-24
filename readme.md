![Gera Bandeira](./assets/readme.gif)
## 🇧🇷 Gerador de bandeira
Uma forma simples de gerar o seu próprio lema da bandeira e compartilhar por aí! **[Acesse aqui](https://gerabandeira.netlify.app/)**

É possível interagir via twitter com o robô [@lemadobrasil](https://twitter.com/lemadobrasil) mandando a sua sugestão seguindo os gatilhos e [explicados aqui](https://twitter.com/lemadobrasil/status/1523895283876257798)
## 🥞 Stack
- site feito apenas com html e o poder da Canvas API
- apis feito com Node.js
- GCP Functions
- GCP Task Scheduler
- GCP Cron Scheduler

## ☁️ Upload de imagem (Cloudflare Pages + R2)
- Crie um bucket R2 e deixe-o público via domínio próprio ou URL pública da Cloudflare.
- No projeto Pages, adicione um binding R2 chamado `BANDEIRAS` apontando para esse bucket.
- Defina a variável `PUBLIC_R2_BASE_URL` (ex.: `https://cdn.seu-dominio.com`) no ambiente do Pages e, para desenvolvimento local, copie `.env.example` para `.dev.vars` com o mesmo valor.
- Para desenvolver localmente com `wrangler pages dev`, ajuste `wrangler.toml` com o nome do seu bucket em `bucket_name` e tenha o binding `BANDEIRAS`.
- A função edge está em `functions/api/upload-image.js` e é chamada pelo front em `/api/upload-image`.
- O botão “Compartilhar” do `index.html` rasteriza o SVG e copia a imagem (PNG) diretamente para a área de transferência; se o navegador não suportar copiar imagens, ele baixa o arquivo.
