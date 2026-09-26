"""Build all bundled Cantonese narration with the macOS Sinji voice (built in; no downloads).

Slower delivery for young listeners: speaking rate 140 plus short pauses after commas and full stops.
Films: one track per film with a pause between lines; real line start times are written into
transitions.js between the FILM_TIMINGS markers so captions and scenes follow the recording.

Usage: python3 tools/build-audio.py [films|stories|game ...]   (default: all)
"""
from pathlib import Path
import json, re, subprocess, sys, tempfile, wave

root = Path(__file__).resolve().parent.parent
audio = root / 'audio'
VOICE, RATE, SR = 'Sinji', '140', 22050
LEAD, GAP, TAIL = 0.5, 1.3, 1.2


def spoken(text):
    text = re.sub(r'[\U0001F000-\U0001FAFF☀-➿️]', '', text)
    text = re.sub(r'([，、：；])', r'\1[[slnc 300]]', text)
    return re.sub(r'([。！？])', r'\1[[slnc 600]]', text)


def say_wav(text, path):
    subprocess.run(['say', '-v', VOICE, '-r', RATE, '--file-format=WAVE', f'--data-format=LEI16@{SR}',
                    '-o', str(path), spoken(text)], check=True)
    with wave.open(str(path)) as w:
        frames = w.readframes(w.getnframes())
    if not frames:
        raise SystemExit(f'Empty speech output for: {text[:30]}')
    return frames


def write_m4a(frames, out):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'joined.wav'
        with wave.open(str(wav), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(frames)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', str(wav), str(out)], check=True)
    if out.stat().st_size < 2000:
        raise SystemExit(f'Suspiciously small audio: {out}')
    return len(frames) / 2 / SR


def silence(seconds):
    return b'\0\0' * int(SR * seconds)


def one(text, out):
    with tempfile.TemporaryDirectory() as tmp:
        return write_m4a(silence(.15) + say_wav(text, Path(tmp) / 'a.wav') + silence(.3), out)


def build_films():
    films = json.loads((audio / 'transition-scripts.json').read_text())
    src = (root / 'transitions.js').read_text()
    missing = [line for film in films for line in film if "['" + line + "'" not in src]
    if missing or len(films) != 6:
        raise SystemExit(f'transition-scripts.json out of sync with transitions.js: {len(missing)} lines, {len(films)} films')
    timings = []
    for i, lines in enumerate(films):
        frames, starts = silence(LEAD), []
        with tempfile.TemporaryDirectory() as tmp:
            for j, line in enumerate(lines):
                starts.append(round(len(frames) / 2 / SR, 2))
                frames += say_wav(line, Path(tmp) / f'{j}.wav') + silence(GAP)
        total = write_m4a(frames + silence(TAIL - GAP), audio / f'transition-{i}.m4a')
        timings.append({'starts': starts, 'total': round(total, 2)})
        print(f'  film {i}: {len(lines)} lines, {total:.1f} s')
    new = re.sub(r'/\*FILM_TIMINGS\*/.*?/\*END_FILM_TIMINGS\*/',
                 '/*FILM_TIMINGS*/' + json.dumps(timings, separators=(',', ':')) + '/*END_FILM_TIMINGS*/', src, flags=re.S)
    if new == src and '/*FILM_TIMINGS*/' not in src:
        raise SystemExit('FILM_TIMINGS markers missing in transitions.js')
    (root / 'transitions.js').write_text(new)


def build_stories():
    scripts = json.loads((audio / 'scripts.json').read_text())
    for mode in ('earth', 'human'):
        for i, text in enumerate(scripts[mode]):
            print(f'  {mode}-{i}: {one(text, audio / f"{mode}-{i}.m4a"):.1f} s')


def build_game():
    lines = json.loads((audio / 'game-scripts.json').read_text())
    src = (root / 'game.js').read_text()
    questions = re.findall(r"question:\['([^']+)'", src)
    if len(lines) != len(questions) + 3:
        raise SystemExit(f'game-scripts.json has {len(lines)} lines for {len(questions)} missions (+3 feedback)')
    for i, q in enumerate(questions):
        if q not in lines[i]:
            raise SystemExit(f'Mission {i} audio script does not contain its question: {q}')
    names = [f'game-{i}' for i in range(len(questions))] + ['game-correct', 'game-retry', 'game-finish']
    for name, text in zip(names, lines):
        print(f'  {name}: {one(text, audio / f"{name}.m4a"):.1f} s')


if __name__ == '__main__':
    parts = sys.argv[1:] or ['films', 'stories', 'game']
    for part in parts:
        print(part)
        {'films': build_films, 'stories': build_stories, 'game': build_game}[part]()
