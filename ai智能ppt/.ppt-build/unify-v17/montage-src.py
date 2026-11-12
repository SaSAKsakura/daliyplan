from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
p=Path('.ppt-build/unify-v17');out=Image.new('RGB',(1280,((21+2)//3)*264),'#dddddd')
for n in range(1,22):
 im=Image.open(p/f'src-{n}.png');im.thumbnail((420,236));x=((n-1)%3)*426;y=((n-1)//3)*264;out.paste(im,(x,y));ImageDraw.Draw(out).text((x+6,y+237),str(n),fill='black')
out.save(p/'before-montage.jpg')

