# Run with
# python3 getlines.py ../content/ ../content/dubbing/

from dataclasses import dataclass
import elevenlabs
import glob
import hashlib
import json
import os
import sys
import tqdm

def get_all_says(content_dir):
    for file in glob.glob(content_dir + '/*/*.json'):
        if file.endswith('.original.json'):
            continue
        room = json.load(open(file))
        # TODO items? And first person lines in general?
        for zone in room['zones']:
            for action in zone['actions']:
                if 'say' in action:
                    yield action['say']

says = list(get_all_says(sys.argv[1]))

VOICE_MAP = {
    'Izák': 'ovVFY3Dg05IU2oN1OtVR',
    'Isaac': 'ovVFY3Dg05IU2oN1OtVR',
    'Mikuláš': 'ZHTBLfwcxqZxJan5ZdfN',
    'Nicolaus': 'ZHTBLfwcxqZxJan5ZdfN',
}

@dataclass
class Line:
    voice: str
    full_line: str
    dubbed_line: str
    language: str

to_dub = []

for say in says:
    # TODO some says are not translated.
    if isinstance(say, str):
        continue
    for lang, line in say.items():
        for start, voice in VOICE_MAP.items():
            prefix = f'{start}: '
            if line.startswith(prefix):
                to_dub.append(Line(voice, line, line[len(prefix):], lang))

#to_dub = to_dub[:1]

elevenlabs.set_api_key(os.environ['ELEVENLABS_API_KEY'])

for line in tqdm.tqdm(to_dub):
    m = hashlib.sha256()
    m.update(line.full_line.encode('utf-8'))
    path = sys.argv[2] + '/' + m.hexdigest() + '.mp3'
    if os.path.isfile(path):
        continue
    print(path, line)
    audio = elevenlabs.generate(line.dubbed_line, model='eleven_multilingual_v2', voice=line.voice)
    with open(path, 'wb') as f:
        f.write(audio)