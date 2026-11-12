# Fábrica de Terror 2D — MVP sem APIs pagas

Gera MP4 vertical 720×1280, 60 segundos, 12 fps, **seis cenas ilustradas por código**, zoom/pan leve, caixas de legendas por cena, histórias recombinadas e **narração sintética PT-BR se `espeak-ng` estiver instalado**. Não usa modelos de IA generativa; este MVP permite provar a automação gratuita antes de agregar LLM, imagens ou animação mais sofisticada. Não publica em redes.

## Requisitos (Ubuntu/Debian)

- Node.js >=20
- FFmpeg/FFprobe com libx264
- Python3 + Pillow (`python3-pil`)
- `espeak-ng` para voz sintética (opcional, mas recomendado)

```bash
bash install-ubuntu.sh
npm run doctor
npm run generate
```

O vídeo e o `manifest.json` ficam em `output/<id>/`. Não há chaves de API, cobranças nem dependências npm.

## Agendar sem usar o teclado diariamente

```bash
sudo apt-get install -y cron util-linux
sudo systemctl enable --now cron
bash install-cron.sh
crontab -l
```

Horários escolhidos: **09h, 15h, 21h**, em São Paulo. Dependendo do cron instalado, `CRON_TZ` pode não controlar o fuso de disparo; confirme com `timedatectl` e ajuste o agendamento para seu fuso caso necessário. A máquina precisa estar ligada.

## Limitações e próximos módulos

1. **Qualidade:** os quadros são desenhos programáticos; não são animações de personagens com lip-sync. O movimento inicial é de câmera, não dos objetos.
2. **Histórias:** há quatro roteiros iniciais; a repetição é inevitável após alguns vídeos. Para obter 90 histórias originais/mês, integrar modelo de texto local ou aumentar o banco editorial.
3. **Áudio:** espeak-ng funciona offline e gratuitamente, mas tem voz robótica. Piper TTS em pt-BR é um upgrade opcional após testar desempenho e licenças de voz.
4. **Hardware:** 3×60s/dia podem sobrecarregar CPUs antigas. Teste uma renderização e registre duração e consumo antes de ativar o cron.
5. **Render:** manter apenas API/painel eventual; free web service dorme e não mantém arquivos locais.
6. **Supabase:** integrar posteriormente para salvar metadados (status, histórico, arquivos), respeitando limites gratuitos. Neste MVP tudo é salvo localmente.
7. **Segurança:** não expor o servidor diretamente à Internet; cron e FFmpeg devem rodar com usuário sem privilégios.

## Layout

- `src/generate.mjs` — pipeline Node.js e renderização FFmpeg
- `src/art.py` — renderização de ilustrações originais (Pillow)
- `install-ubuntu.sh` — instala dependências Linux
- `install-cron.sh` — agenda 3 execuções diárias
- `output/` — resultado em MP4 e manifesto

## Uso rápido

```bash
npm run generate  # 1 vídeo
npm run batch     # 3 vídeos (para teste, não é o agendamento)
```
