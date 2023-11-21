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
        if os.path.basename(os.path.dirname(file)) == 'dubbing':
            continue
        if file.endswith('.original.json'):
            continue
        room = json.load(open(file))
        # TODO items? And first person lines in general?
        for zone in room['zones']:
            for action in zone['actions']:
                if 'say' in action:
                    yield action['say']

says = list(get_all_says(sys.argv[1]))

# TODO: Other voice options (speed etc)?
def voice(id):
    return {
        'model': 'eleven_multilingual_v2',
        'voice': id
    }

# TODO: Voice modifiers ("crying" etc)?
VOICE_MAP = {    
    # Guy
    'Izák': voice('ovVFY3Dg05IU2oN1OtVR'),
    'Isaac': voice('ovVFY3Dg05IU2oN1OtVR'),
    # Neil
    'Mikuláš': voice('ZHTBLfwcxqZxJan5ZdfN'),
    'Nicolaus': voice('ZHTBLfwcxqZxJan5ZdfN'),
    # Ryan
    'Gustáv': voice('d8mfvnU6fBNQh1oGxKLG'),
    'Augustus': voice('d8mfvnU6fBNQh1oGxKLG'),
    # Cooper
    'Turista': voice('nCGlWx7HG9NmtqHKY65R'),
    'Tourist': voice('nCGlWx7HG9NmtqHKY65R'),
    # Wesley
    'Leonardo': voice('vt9DFlxogrMUvGp5sWRY'),
}

@dataclass
class Line:
    full_line: str
    dubbed_line: str
    voice_settings: dict[str, str]

to_dub = []

for say in says:
    # TODO some says are not translated.
    if isinstance(say, str):
        continue
    for lang, line in say.items():
        for start, voice_settings in VOICE_MAP.items():
            prefix = f'{start}: '
            if line.startswith(prefix):
                to_dub.append(Line(line, line[len(prefix):], voice_settings))

elevenlabs.set_api_key(os.environ['ELEVENLABS_API_KEY'])

for line in tqdm.tqdm(to_dub):
    # Lines are keyed by the hash of the full line, so the frontend
    # can easily refer to them.
    m = hashlib.sha256()
    m.update(line.full_line.encode('utf-8'))
    output_basename = sys.argv[2] + '/' + m.hexdigest()
    
    if os.path.isfile(output_basename + '.json'):
        previous_settings = json.load(open(output_basename + '.json'))
        if previous_settings == line.voice_settings:
            continue
    
    print('Dubbing', line.full_line, 'into', output_basename)
    audio = elevenlabs.generate(line.dubbed_line, **voice_settings)
    
    with open(output_basename + '.mp3', 'wb') as f:
        f.write(audio)
    with open(output_basename + '.json', 'w') as f:
        json.dump(line.voice_settings, f)