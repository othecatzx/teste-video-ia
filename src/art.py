#!/usr/bin/env python3
"""Draw original stylized scenes with Pillow. No external image model or downloads."""
import sys, json, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=720,1280
font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
reg='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def F(n,bold=True):
    try:return ImageFont.truetype(font if bold else reg,n)
    except:return ImageFont.load_default()
def poly(d,pts,fill,outline='#15202d',width=7):d.polygon(pts,fill=fill);d.line(pts+[pts[0]],fill=outline,width=width,joint='curve')
def draw_scene(out,title,subtitle,seed,scene):
    rng=random.Random(seed); im=Image.new('RGB',(W,H),'#17202c');d=ImageDraw.Draw(im)
    # flashlight / night sky
    d.rectangle((0,0,W,690),fill='#333e55')
    d.rectangle((0,0,W,135),fill='#263345');d.line((0,135,W,135),fill='#0b101e',width=9)
    # windows and double glass doors
    poly(d,[(95,190),(625,190),(650,830),(72,830)],'#10182a')
    poly(d,[(114,211),(354,211),(348,795),(100,800)],'#1e3459')
    poly(d,[(369,211),(608,211),(624,796),(368,795)],'#1b2c4c')
    d.line((360,194,360,815),fill='#c1c5cc',width=10)
    for j in range(14):
        x=rng.randrange(140,595);y=rng.randrange(260,660)
        d.rectangle((x,y,x+28,y+39),fill=rng.choice(['#31496b','#e8cb6c','#223553']))
    if scene in (1,3,5):
        d.ellipse((485,220,544,278),fill='#f7e2a1')
    # ominous distant silhouette
    if scene>=3:
        x=455+scene*7
        d.ellipse((x-39,490,x+39,560),fill='#080c19')
        d.polygon([(x-52,545),(x+52,545),(x+77,810),(x-68,810)], fill='#080c19')
        if scene==5:
            d.ellipse((x-21,523,x-9,532),fill='#e96966');d.ellipse((x+13,523,x+25,532),fill='#e96966')
    # room panels
    poly(d,[(0,610),(80,610),(70,840),(0,858)],'#2b6263')
    poly(d,[(649,610),(720,610),(720,865),(656,836)],'#2b6263')
    poly(d,[(0,848),(720,848),(720,1280),(0,1280)],'#735a4d')
    # desk paperwork
    poly(d,[(105,890),(540,904),(630,1104),(36,1084)],'#193a61')
    poly(d,[(127,905),(510,924),(571,1070),(74,1055)],'#e2e5de')
    for y in (954,982,1011,1041):d.line((135,y,468,y+14),fill='#949f9d',width=4)
    # handheld intercom
    d.ellipse((475,970,700,1250),fill='#453c3a')
    d.rounded_rectangle((554,843,711,1170),25,fill='#222932',outline='#0b101d',width=12)
    d.ellipse((594,897,670,973),fill='#454c59',outline='#10141d',width=8)
    for angle in range(0,360,60):
        a=math.radians(angle);x=632+19*math.cos(a);y=934+19*math.sin(a)
        d.ellipse((x-5,y-5,x+5,y+5),fill='#101622')
    d.rounded_rectangle((530,1105,681,1290),28,fill='#ac805f',outline='#11141c',width=10)
    # near hand
    d.rounded_rectangle((55,1100,245,1280),36,fill='#997458',outline='#10141d',width=11)
    for x in (71,119,167,215):d.rounded_rectangle((x,1072,x+45,1160),17,fill='#a17b5e',outline='#10141d',width=7)
    # title plate and dialogue box drawn over composition
    d.rounded_rectangle((35,33,685,113),18,fill='#0e1629',outline='#70b5c4',width=4)
    d.text((360,73),title,font=F(35),fill='#deeced',anchor='mm',stroke_width=1)
    d.rounded_rectangle((30,875,690,1060),25,fill='#0b1524',outline='#65c6d4',width=4)
    # line breaks by pixel width
    words=subtitle.split();lines=[];cur=''
    for word in words:
        trial=(cur+' '+word).strip()
        if d.textbbox((0,0),trial,font=F(40))[2]>605 and cur:lines.append(cur);cur=word
        else:cur=trial
    if cur:lines.append(cur)
    lines=lines[:3];step=49;start=968-(len(lines)-1)*step/2
    for i,line in enumerate(lines):
        d.text((360,start+i*step),line,anchor='mm',font=F(40),fill='#51ddf5',stroke_width=4,stroke_fill='#000814')
    im.save(out)
if __name__=='__main__':
    out,title,subtitle,seed,scene=sys.argv[1:6]
    draw_scene(out,title,subtitle,int(seed),int(scene))
