import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..'), output=join(root,'output');
const command=(bin,args,opts={})=>spawnSync(bin,args,{encoding:'utf8',...opts});
function requireCmd(name){const r=command('which',[name]);if(r.status!==0) throw Error(`Faltando: ${name}`);}
const stories=[
 {title:'INTERFONE • 804',lines:['A portaria estava vazia naquela noite.','Às duas e treze, o interfone começou a tocar.','Do outro lado, alguém sussurrou: não abra a porta.','Olhei pelo vidro. Havia uma pessoa imóvel no corredor.','Então a voz disse: aquilo não está do lado de fora.','Atrás de mim, o mesmo interfone começou a tocar.']},
 {title:'TURNO • 03',lines:['No meu primeiro plantão, encontrei uma regra estranha.','Nunca olhe a câmera quatro depois da meia-noite.','Às três, a tela ligou sozinha e mostrou meu rosto.','Mas eu estava sentado, e na imagem aparecia de pé.','A figura começou a caminhar em direção à câmera.','Foi quando percebi: ela estava vindo buscar meu lugar.']},
 {title:'PORTA • 13',lines:['O elevador parou em um andar que não existia.','A placa marcava treze, apesar de o prédio ter oito.','Uma voz infantil pediu para eu segurar a porta.','Vi dois sapatos pequenos parados na escuridão.','Quando a luz piscou, os sapatos estavam dentro.','O elevador desceu. Mas agora havia alguém comigo.']},
 {title:'CORREDOR • B',lines:['Toda noite, passos ecoavam depois do expediente.','O segurança dizia que era a tubulação antiga.','Até que os passos começaram a imitar os meus.','Eu parava. Eles paravam um segundo depois.','Corri até a saída e encontrei a porta trancada.','Do meu lado, alguém sussurrou: agora você entendeu.']}
];
function log(x){console.log(new Date().toISOString(),x)}
function doctor(){for (const c of ['node','python3','ffmpeg','ffprobe']){const r=command('which',[c]);log(`${c}: ${r.status===0?'OK':'FALTANDO'}`)}
 let r=command('python3',['-c','from PIL import Image; print("Pillow OK")']);log(r.status===0?'Pillow OK':'Pillow FALTANDO');
 log(`espeak-ng: ${command('which',['espeak-ng']).status===0?'OK':'não instalado (saída sem narração)'}`)}
function run(bin,args){let r=command(bin,args,{maxBuffer:10*1024*1024});if(r.status!==0)throw Error(`${bin} falhou:\n${r.stderr?.slice(-3500)||r.stdout}`)}
function renderOne(index){
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');const id=`${stamp}-${process.pid}-${index}`;
 const dir=join(output,id);mkdirSync(dir,{recursive:true});
 let story=stories[(new Date().getDate()*3+new Date().getHours()+index)%stories.length];
 let seed=Date.now()%100000+index*71;
 let manifest={id,created_at:new Date().toISOString(),duration_seconds:60,fps:12,resolution:'720x1280',story,voice:false};
 let sceneFiles=[];
 for(let j=0;j<6;j++){
  const img=join(dir,`scene-${j+1}.png`), vid=join(dir,`scene-${j+1}.mp4`);
  run('python3',[join(root,'src','art.py'),img,story.title,story.lines[j],String(seed+j),String(j)]);
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-loop','1','-framerate','12','-i',img,'-t','10',
   '-vf',`scale=736:1308,crop=720:1280:x='8+4*sin(t/2)':y='14+3*cos(t/3)',format=yuv420p`,
   '-an','-r','12','-c:v','libx264','-preset','ultrafast','-crf','29','-movflags','+faststart',vid]);
  sceneFiles.push(vid);log(`Cena ${j+1}/6 do vídeo ${index} pronta`);
 }
 const concat=join(dir,'concat.txt');writeFileSync(concat,sceneFiles.map(v=>`file '${v.replaceAll("'","'\\''")}'`).join('\n')+'\n');
 const silent=join(dir,'silent.mp4');run('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',concat,'-c','copy',silent]);
 const wav=join(dir,'voice.wav');const tts=command('which',['espeak-ng']);
 if(tts.status===0){
  // one voice segment per scene, at most 10 seconds; dialogue already appears on frame
  const speech=[];
  for(let j=0;j<6;j++){
   const w=join(dir,`voice-${j}.wav`);
   run('espeak-ng',['-v','pt-br','-s','145','-w',w,story.lines[j]]);
   let len=Number(command('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',w]).stdout.trim());
   if(len>9.8){ // speed up (within atempo support)
    const short=join(dir,`voice-short-${j}.wav`);run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',w,'-af',`atempo=${Math.min(len/9.6,2).toFixed(3)}`,short]);copyFileSync(short,w);
   }
   speech.push(w);
  }
  // concat 10s audio slots, preserving exact scene starts
  let inputs=[];for(const s of speech)inputs.push('-i',s);
  let filters=speech.map((s,j)=>`[${j}:a]apad=pad_dur=10,atrim=0:10,asetpts=PTS-STARTPTS[a${j}]`).join(';')+';'+speech.map((_,j)=>`[a${j}]`).join('')+'concat=n=6:v=0:a=1[a]';
  run('ffmpeg',['-hide_banner','-loglevel','error','-y',...inputs,'-filter_complex',filters,'-map','[a]','-t','60','-ar','24000',wav]);
  manifest.voice=true;
 }
 const result=join(dir,`${id}.mp4`);
 let muxArgs=['-hide_banner','-loglevel','error','-y','-i',silent];
 if(manifest.voice)muxArgs.push('-i',wav);else muxArgs.push('-f','lavfi','-i','anullsrc=channel_layout=mono:sample_rate=24000');
 muxArgs.push('-map','0:v:0','-map','1:a:0','-t','60','-c:v','copy','-c:a','aac','-b:a','96k','-movflags','+faststart',result);
 run('ffmpeg',muxArgs);
 manifest.output=result;writeFileSync(join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 log(`PRONTO ${result} (${manifest.voice?'com narração':'sem narração: instale espeak-ng'})`);
 return result;
}
try{
 const args=process.argv.slice(2);if(args.includes('--doctor'))doctor();else{
  requireCmd('python3');requireCmd('ffmpeg');requireCmd('ffprobe');
  const count=Math.max(1,Math.min(3,Number(args.find(x=>x.startsWith('--count='))?.split('=')[1]||1)));
  mkdirSync(output,{recursive:true});for(let j=0;j<count;j++)renderOne(j+1);
 }
}catch(e){console.error(e.message);process.exitCode=1}
