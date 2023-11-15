use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn foo() {
    web_sys::console::log_1(&"Hello from Rust!".into());
}

#[wasm_bindgen]
pub fn get_hint(rooms: &str, state: &str) {
    //web_sys::console::log_1(&format!("rooms {} state {}", rooms.len(), state.len()).into());
    //web_sys::console::log_1(&format!("state {}", state).into());

    let state: JsState = serde_json::from_str(state).unwrap();
    let generator = generator::HintGenerator::new(rooms);
    let path = generator.find_path(
        &state.room,
        &state.flags,
        &state.items,
        &state.items_taken,
        "a4_finale",
    );
    if let Some(path) = path {
        web_sys::console::log_1(&format!("Path: {:?}", path).into());
    } else {
        web_sys::console::log_1(&"No path found".into());
    }
}

#[derive(Deserialize)]
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
