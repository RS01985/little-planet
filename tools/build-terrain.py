from pathlib import Path
from PIL import Image
import json,gc,argparse
Image.MAX_IMAGE_PIXELS=500_000_000
parser=argparse.ArgumentParser(description='Build NASA terrain tiles from approved, locally downloaded A1–D2 JPEGs')
parser.add_argument('source',type=Path,help='Folder containing A1.jpg through D2.jpg')
parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parent.parent/'terrain')
args=parser.parse_args();root=args.source;out=args.output
if out.exists():raise SystemExit('Output already exists; choose a new directory to preserve existing tiles')
out.mkdir(parents=True)
tile=1350;records=[]
for row in range(2):
 for col,letter in enumerate('ABCD'):
  part=letter+str(row+1);path=root/(part+'.jpg')
  with Image.open(path) as original:
   assert original.size==(21600,21600)
   original.load()
   for grid in [64,32,16,8]:
    count=grid//4;side=count*tile
    im=original if grid==64 else original.resize((side,side),Image.Resampling.LANCZOS)
    for x in range(count):
     folder=out/str(grid)/str(col*count+x);folder.mkdir(parents=True,exist_ok=True)
     for y in range(count):
      dest=folder/(str(row*count+y)+'.jpg')
      crop=im.crop((x*tile,y*tile,(x+1)*tile,(y+1)*tile))
      crop.save(dest,quality=80,optimize=True,subsampling=2)
      crop.close()
    if im is not original:im.close()
   print('Processed',part,flush=True)
  gc.collect()
files=list(out.rglob('*.jpg'))
manifest={'tileSize':tile,'grids':[8,16,32,64],'highestResolution':'500 m per pixel at equator (NASA designation)','source':'NASA Blue Marble Next Generation, January 2004','tiles':len(files),'bytes':sum(p.stat().st_size for p in files)}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(manifest,flush=True)
