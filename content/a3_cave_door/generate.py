zone_sequence = [
    '#00FF00', # Green
    '#FF00FF', # Pink
    '#FF00FF', # Pink
    '#0000FF', # Blue
    '#00FF00', # Green
    '#0000FF', # Blue
    '#00FF00', # Green
    '#00FFFF', # Purple
    '#0000FF', # Blue
    '#FF0000', # Red
]

all_flags_except_zero = ','.join(f'cave_door_state{i}' for i in range(1, len(zone_sequence)))

print('''
    "enterAction": {{
        "setFlag": "cave_door_state0",
        "unsetFlag": "{}"
    }},
'''.format(all_flags_except_zero))

for zone in sorted(set(zone_sequence)):
    print('''        {{
            "color": "{}",
            "actions": ['''.format(zone))
    for i, z in enumerate(zone_sequence):
        end = ',' if i + 1 < len(zone_sequence) else ''
        if z != zone:
            print('''                {{
                    "conditions": {{
                        "hasFlags": "cave_door_state{}"
                    }},
                    "say": "BZZZT!",
                    "setFlag": "cave_door_state0",
                    "unsetFlag": "{}"
                }}{}'''.format(i, all_flags_except_zero, end))
        elif i + 1 == len(zone_sequence):
            print('''                {{
                    "conditions": {{
                        "hasFlags": "cave_door_state{}"
                    }},
                    "say": "Klik!",
                    "setFlag": "cave_door_unlocked"
                }}{}'''.format(i, end))
        else:
            print('''                {{
                    "conditions": {{
                        "hasFlags": "cave_door_state{}"
                    }},
                    "say": "Piiip",
                    "setFlag": "cave_door_state{}",
                    "unsetFlag": "cave_door_state{}"
                }}{}'''.format(i, i+1, i, end))
    print('''            ]
        }},'''.format(all_flags_except_zero))   