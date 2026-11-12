# Fábrica de terror 2D sem servidor próprio

## O que esta versão faz

O próprio GitHub Actions executa uma máquina temporária, gera **um MP4 de 60 segundos** por execução, narra em português com `espeak-ng` e disponibiliza o arquivo na aba **Actions > execução > Artifacts**. O cron faz 3 tentativas por dia: **09:07, 15:07 e 21:07 (São Paulo)**. Também é possível clicar em **Run workflow** para testar.

**Não precisa ter Linux, Windows ou Render ligados.** Não precisa configurar Supabase nem credenciais para este MVP.

## Primeira configuração

1. Crie um **novo repositório público** no GitHub (recomendado: `fabrica-terror-2d`) e envie o conteúdo da pasta `fabrica-terror-2d/` para a **raiz** do repositório. Mantenha o diretório oculto `.github/workflows/`.
2. Abra **Actions** e habilite workflows, se solicitado.
3. Em **Actions > Gerar video 2D automaticamente > Run workflow**, rode um teste manual.
4. Quando a execução terminar, abra o link da execução e baixe `terror-2d-...` na seção **Artifacts**.
5. O sistema continuará tentando gerar vídeos nos horários configurados, sem o seu computador ligado.

## Limitações importantes

- O gerador ainda é procedural e usa **quatro histórias predefinidas**. Não é uma IA generativa comparável ao Kling, nem garante originalidade após alguns dias. A animação é um movimento suave de câmera sobre ilustrações estáticas, e o `espeak-ng` produz uma voz sintética básica.
- O GitHub pode atrasar ou até pular execuções agendadas. Em repositórios públicos, o agendamento pode ser desativado após **60 dias de inatividade**.
- O arquivo MP4 fica em **Artifacts por apenas 7 dias**; é necessário baixar antes de expirar. Não configure publicação pública automática sem uma segunda etapa segura de armazenamento.
- O uso de runners padrão em repositórios públicos é gratuito conforme a política atual do GitHub, sujeito às regras de uso. Em repositórios privados, as cotas são diferentes.
- Para três vídeos diários, o fluxo executa **uma vez por horário**, não três vídeos em um só horário.
- O projeto não depende do seu Render, Supabase ou domínio. Podemos integrá-los posteriormente para histórico, painel e armazenamento.

## Arquivos principais

- `.github/workflows/gerar-video.yml`: agendamento e execução cloud.
- `src/generate.mjs`: orquestração e montagem dos 6 segmentos de 10s.
- `src/art.py`: imagens verticais em estilo cartoon.
- `output/`: vídeos gerados (na execução, ficam disponíveis nos Artifacts).

## Execução manual em outros ambientes

```bash
npm run generate
```

Esse comando exige Python, Pillow e FFmpeg; a narração requer `espeak-ng`. O workflow instala essas dependências automaticamente.
