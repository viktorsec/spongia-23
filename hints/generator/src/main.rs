fn main() {
    let content_dir = std::env::args()
        .nth(1)
        .expect("Requires one argument for the content directory");

    let start_room = std::env::args().nth(2).unwrap_or("a0_inside".to_string());
    let end_room = std::env::args()
        .nth(3)
        .unwrap_or("a2_forest_path".to_string()); // TODO

    // TODO start flags/items

    // Concat to JSON array. That is what wasm will get.
    let mut rooms = Vec::new();
    for subdir in std::fs::read_dir(content_dir).unwrap() {
        let subdir = subdir.unwrap();
        if !subdir.file_type().unwrap().is_dir() {
            continue;
        }
        for entry in std::fs::read_dir(subdir.path()).unwrap() {
            let entry = entry.unwrap().path();
            if entry.extension().unwrap_or_default() != "json" {
                continue;
            }
            if entry
                .file_stem()
                .map(std::ffi::OsStr::to_str)
                .flatten()
                .map(|stem| stem.ends_with(".original"))
                .unwrap_or(false)
            {
                continue;
            }

            rooms.push(std::fs::read_to_string(entry).unwrap());
        }
    }

    let generator = generator::HintGenerator::new(&format!("[{}]", &rooms.join(",")));

    let path = generator.find_path(
        &start_room,
        &vec!["dud_level_3".to_string()],
        &vec![],
        &vec![],
        &end_room,
    );
    if let Some(path) = path {
        println!("Path: {:?}", path);
    } else {
        println!("No path found");
    }
}
