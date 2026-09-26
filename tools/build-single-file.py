from pathlib import Path
import base64, json
root=Path(__file__).resolve().parent.parent
out=root
html=(out/'index.html').read_text()
css=(out/'styles.css').read_text()
js=(out/'app.js').read_text()+'\n/*GAME_SCRIPT_BOUNDARY*/\n'+(out/'terrain.js').read_text().replace("const terrainBase='terrain/';","const terrainBase=null;")+'\n/*GAME_SCRIPT_BOUNDARY*/\n'+(out/'game.js').read_text()
texture=out/'earth-hd.jpg'
if texture.exists():
    uri='data:image/jpeg;base64,'+base64.b64encode(texture.read_bytes()).decode()
    js=js.replace("const textureURI='earth-hd.jpg';","const textureURI='"+uri+"';")
for audio in (out/'audio').glob('*.m4a'):
    audio_uri='data:audio/mp4;base64,'+base64.b64encode(audio.read_bytes()).decode()
    js=js.replace(json.dumps('audio/'+audio.name),json.dumps(audio_uri))
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
js=js.replace('\n/*GAME_SCRIPT_BOUNDARY*/\n','</script><script>')
html=html.replace('<script src="app.js"></script><script src="terrain.js"></script><script src="game.js"></script>','<script>'+js+'</script>')
(out/'little-planet.html').write_text(html)
print('Built self-contained HTML:',len(html.encode()),'bytes. NASA texture:',texture.exists())
