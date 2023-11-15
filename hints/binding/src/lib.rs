use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn foo() {
    web_sys::console::log_1(&"Hello from Rust!".into());
}

#[wasm_bindgen]
pub struct GeneratorState(generator::HintGenerator);

#[derive(Serialize)]
struct NextAction {
    items: bool,
    zone: Option<String>,
    trigger: Option<String>,
}

#[wasm_bindgen]
impl GeneratorState {
    pub fn new(rooms: &str) -> Self {
        let generator = generator::HintGenerator::new(rooms);
        Self(generator)
    }

    pub fn next_action(&self, state: &str, end_room: &str) -> String {
        let state: JsState = serde_json::from_str(state).unwrap();
        let path = self.0.find_path(
            &state.room,
            &state.flags,
            &state.items,
            &state.items_taken,
            end_room,
        );
        web_sys::console::log_1(&format!("State: {:?}", state).into());

        if let Some(path) = path {
            web_sys::console::log_1(&format!("Path: {:?}", path).into());
            let action = match path.get(0).unwrap() {
                generator::Step::Zone {
                    color,
                    trigger_item,
                } => NextAction {
                    items: false,
                    zone: Some(color.clone()),
                    trigger: trigger_item.clone(),
                },
                generator::Step::TakeItems => NextAction {
                    items: true,
                    zone: None,
                    trigger: None,
                },
            };

            return serde_json::to_string(&action).unwrap();
        }
        web_sys::console::log_1(&"No path found".into());
        return "{}".to_string();
    }
}

#[derive(Deserialize, Debug)]
struct JsState {
    #[serde(rename = "currentRoom")]
    room: String,
    flags: Vec<String>,
    items: Vec<String>,
    #[serde(rename = "itemsTaken")]
    items_taken: Vec<String>,
}

// TODO
// pub fn set_panic_hook() {
//     // When the `console_error_panic_hook` feature is enabled, we can call the
//     // `set_panic_hook` function at least once during initialization, and then
//     // we will get better error messages if our code ever panics.
//     //
//     // For more details see
//     // https://github.com/rustwasm/console_error_panic_hook#readme
//     #[cfg(feature = "console_error_panic_hook")]
//     console_error_panic_hook::set_once();
// }
