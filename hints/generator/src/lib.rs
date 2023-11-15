use std::collections::{BTreeMap, HashMap, VecDeque};

#[derive(Debug)]
pub struct HintGenerator {
    rooms: BTreeMap<String, compact::Room>,
    flag_masks: BTreeMap<String, u64>,
    item_masks: BTreeMap<String, u64>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct State<'a> {
    room: &'a str,
    flags: u64,
    items: u64,
    items_taken: u64,
    action_count: Option<usize>,
}

#[derive(Debug, Clone)]
pub enum Transition {
    Zone {
        color: String,
        trigger_item: Option<u64>,
    },
    TakeItems,
}

fn create_mask<T>(map: &mut BTreeMap<String, u64>, key: T) -> u64
where
    T: AsRef<str>,
{
    let len = map.len();
    assert!(len <= 63, "too many flags/items");
    *map.entry(key.as_ref().to_string()).or_insert(1 << len)
}

fn create_mask_set<T, U>(map: &mut BTreeMap<String, u64>, keys: T) -> u64
where
    T: IntoIterator<Item = U>,
    U: AsRef<str>,
{
    let mut mask = 0;
    for key in keys {
        mask |= create_mask(map, key.as_ref());
    }
    mask
}

fn get_mask<T>(map: &BTreeMap<String, u64>, key: T) -> u64
where
    T: AsRef<str>,
{
    *map.get(&key.as_ref().to_string()).unwrap()
}

fn get_mask_set<T, U>(map: &BTreeMap<String, u64>, keys: T) -> u64
where
    T: IntoIterator<Item = U>,
    U: AsRef<str>,
{
    let mut mask = 0;
    for key in keys {
        mask |= get_mask(map, key.as_ref());
    }
    mask
}

fn apply_action<'a>(state: &mut State<'a>, action: &'a compact::Action) {
    if let Some(goto) = &action.goto {
        state.room = &goto;
    }

    state.flags |= action.set_flags;
    state.flags &= !action.unset_flags;
    state.flags ^= action.flip_flags;

    state.items |= action.give_items;
    state.items &= !action.take_items;
}

fn parse_action(
    raw_action: raw::Action,
    flag_masks: &mut BTreeMap<String, u64>,
    item_masks: &mut BTreeMap<String, u64>,
) -> compact::Action {
    compact::Action {
        conditions: compact::Conditions {
            has_flags: create_mask_set(flag_masks, raw_action.conditions.has_flags),
            has_flags_not: create_mask_set(flag_masks, raw_action.conditions.has_flags_not),
            has_items: raw_action
                .conditions
                .has_item
                .map(|item| create_mask(item_masks, item))
                .unwrap_or(0),
            has_items_not: raw_action
                .conditions
                .has_item_not
                .map(|item| create_mask(item_masks, item))
                .unwrap_or(0),
        },
        trigger: raw_action
            .trigger
            .map(|item| create_mask(item_masks, item))
            .unwrap_or(0),

        goto: raw_action.goto,
        give_items: raw_action
            .give_item
            .map(|item| create_mask(item_masks, &item))
            .unwrap_or(0),
        take_items: raw_action
            .take_item
            .map(|item| create_mask(item_masks, &item))
            .unwrap_or(0),
        set_flags: create_mask_set(flag_masks, raw_action.set_flags),
        unset_flags: create_mask_set(flag_masks, raw_action.unset_flags),
        flip_flags: create_mask_set(flag_masks, raw_action.flip_flags),
    }
}

impl HintGenerator {
    pub fn new(serialized_rooms: &str) -> HintGenerator {
        //         // Parse the raw format.
        let raw_rooms: Vec<raw::Room> = serde_json::from_str(serialized_rooms).unwrap();

        // Convert to a more compact representation.
        let mut rooms = BTreeMap::new();
        let mut flag_masks = BTreeMap::new();
        let mut item_masks = BTreeMap::new();

        for raw_room in raw_rooms {
            let mut room = compact::Room {
                items: create_mask_set(
                    &mut item_masks,
                    raw_room.items.iter().map(|item| item.id.as_str()),
                ),
                zones: BTreeMap::new(),
                enter_action: raw_room
                    .enter_action
                    .map(|action| parse_action(action, &mut flag_masks, &mut item_masks)),
                leave_action: raw_room
                    .leave_action
                    .map(|action| parse_action(action, &mut flag_masks, &mut item_masks)),
                max_actions: raw_room.max_actions,
            };
            for raw_zone in raw_room.zones {
                let mut actions = Vec::new();
                for raw_action in raw_zone.actions {
                    actions.push(parse_action(raw_action, &mut flag_masks, &mut item_masks));
                }
                room.zones.insert(raw_zone.color, actions);
            }

            rooms.insert(raw_room.id, room);
        }

        //dbg!(
        HintGenerator {
            rooms,
            flag_masks,
            item_masks,
        }
        //)
    }

    // TODO return type. we want state->transition, also both must be something
    // js can parse, so need a json stringify wrapper
    pub fn find_path<'a>(
        &'a self,
        start_room: &'a str,
        start_flags: &Vec<String>,
        start_items: &Vec<String>,
        start_items_taken: &Vec<String>,
        end_room: &str,
    ) -> Option<Vec<Transition>> {
        let start_state = State {
            room: start_room,
            flags: get_mask_set(&self.flag_masks, start_flags),
            items: get_mask_set(&self.item_masks, start_items),
            items_taken: get_mask_set(&self.item_masks, start_items_taken),
            action_count: None,
        };

        let mut queue = VecDeque::new();

        // TODO not working with wasm :/
        // use fasthash::city::Hash64;
        // use fasthash::RandomState;
        // let random_state = RandomState::<Hash64>::new();
        // let mut previous: HashMap<_, Option<(Transition, State)>, _> =
        //     HashMap::with_hasher(random_state);
        let mut previous = HashMap::new();

        queue.push_back(start_state.clone());
        previous.insert(start_state.clone(), None);

        let mut final_state = None;

        while final_state.is_none() && !queue.is_empty() {
            let state = queue.pop_front().unwrap();

            let current_room = &self.rooms[state.room];
            let mut maybe_add_state = |new_state: State<'a>, transition: Transition| {
                if new_state == state {
                    return;
                }
                if new_state.room == end_room {
                    final_state = Some(new_state.clone());
                }
                match previous.entry(new_state) {
                    std::collections::hash_map::Entry::Occupied(_) => {}
                    std::collections::hash_map::Entry::Vacant(entry) => {
                        queue.push_back(entry.key().clone());
                        entry.insert(Some((transition, state.clone())));
                    }
                }
            };

            // Take items.
            let untaken_items = current_room.items & !state.items_taken;
            if untaken_items != 0 {
                let mut new_state = state.clone();
                new_state.items |= untaken_items;
                new_state.items_taken |= untaken_items;
                maybe_add_state(new_state, Transition::TakeItems);
            }

            // Try all zone actions.
            for (color, actions) in current_room.zones.iter() {
                for action in actions {
                    // Horrible hack needed to improve performance.
                    // Prevents backtracking back to first act.
                    if state.room == "a2_forest_path"
                        && action.goto == Some("a0_observatory_exterior".to_string())
                    {
                        continue;
                    }

                    // Item trigger.
                    let mut trigger_item = None;
                    if action.trigger != 0 {
                        if state.items & action.trigger == 0 {
                            continue;
                        }
                        trigger_item = Some(action.trigger);
                    }
                    // Conditions.
                    if state.flags & action.conditions.has_flags != action.conditions.has_flags {
                        continue;
                    }
                    if state.flags & action.conditions.has_flags_not != 0 {
                        continue;
                    }
                    if state.items & action.conditions.has_items != action.conditions.has_items {
                        continue;
                    }
                    if state.items & action.conditions.has_items_not != 0 {
                        continue;
                    }

                    // Eligible action at this point, apply it.
                    let mut new_state = state.clone();
                    new_state.action_count.as_mut().map(|count| *count += 1);

                    apply_action(&mut new_state, action);
                    if new_state.room != state.room {
                        let new_room = &self.rooms[new_state.room];
                        if let Some(enter_action) = &new_room.enter_action {
                            apply_action(&mut new_state, enter_action);
                        }
                        if new_room.max_actions.is_some() {
                            new_state.action_count = Some(0);
                        }
                    }
                    if let Some(max_actions) = current_room.max_actions {
                        if new_state.action_count.unwrap() >= max_actions {
                            apply_action(
                                &mut new_state,
                                current_room.leave_action.as_ref().unwrap(),
                            )
                        }
                    }

                    maybe_add_state(
                        new_state,
                        Transition::Zone {
                            color: color.clone(),
                            trigger_item,
                        },
                    );
                }
            }
        }

        if let Some(mut state) = final_state {
            println!("FOUND after {} states", previous.len());
            let mut path = Vec::new();
            while let Some((ref transition, ref previous_state)) = previous[&state] {
                path.push(transition.clone());
                state = previous_state.clone();
            }
            return Some(path);
        }

        println!("NOT FOUND after {} states", previous.len());
        None
    }
}

mod compact {
    use std::collections::BTreeMap;

    #[derive(Debug)]
    pub struct Room {
        pub items: u64,
        pub zones: BTreeMap<String, Vec<Action>>,
        pub enter_action: Option<Action>,
        pub leave_action: Option<Action>,
        pub max_actions: Option<usize>,
    }

    #[derive(Debug)]
    pub struct Action {
        pub conditions: Conditions,
        pub trigger: u64,

        pub goto: Option<String>,
        pub give_items: u64,
        pub take_items: u64,

        pub set_flags: u64,
        pub unset_flags: u64,
        pub flip_flags: u64,
    }

    #[derive(Debug)]
    pub struct Conditions {
        pub has_flags: u64,
        pub has_flags_not: u64,
        pub has_items: u64,
        pub has_items_not: u64,
    }
}

mod raw {
    use serde::Deserialize;
    use std::collections::BTreeSet;

    #[derive(Deserialize, Debug)]
    pub struct Room {
        pub id: String,
        #[serde(default)]
        pub items: Vec<Item>,
        #[serde(default)]
        pub zones: Vec<Zone>,

        #[serde(default, rename = "enterAction")]
        pub enter_action: Option<Action>,
        #[serde(default, rename = "leaveAction")]
        pub leave_action: Option<Action>,
        #[serde(default, rename = "maxActions")]
        pub max_actions: Option<usize>,
    }

    #[derive(Deserialize, Debug)]
    pub struct Item {
        pub id: String,
    }

    #[derive(Deserialize, Debug)]
    pub struct Zone {
        pub color: String,
        pub actions: Vec<Action>,
    }

    #[derive(Deserialize, Debug)]
    pub struct Action {
        #[serde(default)]
        pub trigger: Option<String>,

        #[serde(default)]
        pub conditions: Conditions,

        #[serde(default)]
        pub goto: Option<String>,
        #[serde(default, rename = "giveItem")]
        pub give_item: Option<String>,
        #[serde(default, rename = "takeItem")]
        pub take_item: Option<String>,

        #[serde(default, rename = "setFlag", deserialize_with = "comma_separated")]
        pub set_flags: BTreeSet<String>,
        #[serde(default, rename = "unsetFlag", deserialize_with = "comma_separated")]
        pub unset_flags: BTreeSet<String>,
        #[serde(default, rename = "flipFlag", deserialize_with = "comma_separated")]
        pub flip_flags: BTreeSet<String>,
    }

    #[derive(Deserialize, Debug, Default)]
    pub struct Conditions {
        #[serde(default, rename = "hasFlags", deserialize_with = "comma_separated")]
        pub has_flags: BTreeSet<String>,
        #[serde(default, rename = "hasFlagsNot", deserialize_with = "comma_separated")]
        pub has_flags_not: BTreeSet<String>,

        #[serde(rename = "hasItem")]
        pub has_item: Option<String>,
        #[serde(rename = "hasItemNot")]
        pub has_item_not: Option<String>,
    }

    fn comma_separated<'de, D>(deserializer: D) -> Result<BTreeSet<String>, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Ok(s.split(',').map(|s| s.to_owned()).collect())
    }
}
