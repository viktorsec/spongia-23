var state = {};
var dirty = true;
var selectedItem = null;

function updateDebug() {
    const el = document.getElementById("debug-state");
    el.innerText = JSON.stringify(state, null, 4);
};

function initialState() {
    return {
        "room": game.initial.room,
        "inventory": [], //["upberry", "downberry", "zapberry", "banana", "full_whisky_a", "empty_whisky", "quarter_potion"],
        "flags": game.initial.flags,
        "objects": {},
    };
}

function objectVisible(label) {
    const objlabel = state.room + "#" + label;
    if (objlabel in state.objects && !state.objects[objlabel]) {
        return false;
    }
    const obj = game.rooms[state.room].objects[label];
    if (obj.guards && !checkGuards(obj.guards)) {
        return false;
    }
    return true;
}

function showState() {
    updateDebug();

    const room = game.rooms[state.room];

    // Viewport.
    const viewport = document.getElementById('viewport');

    // Remove objects.
    while (viewport.childElementCount > 2) {
        viewport.removeChild(viewport.children[2]);
    }
    // Setup background and zones.
    const background = document.getElementById('background');
    background.src = './content/' + room.background;
    const zones = document.getElementById('zones');
    zones.src = './content/' + room.zones;
    // Add objects.
    if (room.objects) {
        for (const label in room.objects) {
            if (!objectVisible(label)) continue;
            const objimg = document.createElement('img');
            objimg.src = './content/' + room.objects[label].image;
            objimg.dataset.label = label;
            viewport.appendChild(objimg);
        }
    }

    // Inventory.
    const inventory = document.getElementById("inventory");
    while (inventory.lastChild) inventory.removeChild(inventory.lastChild);
    for (const item of state.inventory) {
        const itemimg = document.createElement('img');
        itemimg.src = './content/items/' + game.items[item];
        itemimg.dataset.label = item;
        itemimg.onclick = (e) => { updateSelected(item); };
        inventory.appendChild(itemimg);
    }

    dirty = false;
}

function updateSelected(item) {
    document.querySelectorAll('#inventory img').forEach((e) => {
        e.className = '';
    });
    selectedItem = (selectedItem == item) ? null : item;
    if (selectedItem) {
        document.querySelector('#inventory img[data-label="' + item + '"').className = 'selected';
    }
}

function getPixel(image, x, y) {
    // TODO cache this when screen changes, not every click

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);

    // TODO items on top of background should go first.

    return context.getImageData(x, y, 1, 1).data;
}

function findZone(x, y) {
    if (game.rooms[state.room].objects) {
        for (label in game.rooms[state.room].objects) {
            const objectimg = document.querySelector('img[data-label="' + label + '"]');
            if (objectimg == null) continue;
            const rgba = getPixel(objectimg, x, y);
            if (rgba[3] != 0) {
                return label;
            }
        }
    }

    const rgba = getPixel(document.getElementById('zones'), x, y);
    if (rgba[3] != 0) {
        function hexByte(x) {
            return ('0' + x.toString(16)).slice(-2).toUpperCase();
        }
        return "#" + hexByte(rgba[0]) + hexByte(rgba[1]) + hexByte(rgba[2]);
    }

    return null;
}

function debug(text) {
    const prev = document.getElementById('debug-log').innerHTML;
    document.getElementById('debug-log').innerHTML = text + "\n\n" + prev;
}

function say(text) {
    debug("say()");
    const prev = document.getElementById('log').innerHTML;
    document.getElementById('log').innerHTML = text + "\n\n" + prev;
}

function goto(room) {
    debug("goto(" + room + ")");
    state.room = room;
    if (game.rooms[room].enterAction) {
        handleAction(game.rooms[room].enterAction);
    }
    dirty = true;
}

function setFlag(flag) {
    debug("setFlag(" + flag + ")");
    state.flags[flag] = true
    dirty = true;
}

function unsetFlag(flag) {
    debug("unsetFlag(" + flag + ")");
    state.flags[flag] = false
    dirty = true;
}

function flipFlag(flag) {
    debug("flipFlag(" + flag + ")");
    if (!(flag in state.flags)) {
        state.flags[flag] = true; // False by default.
    } else {
        state.flags[flag] = !state.flags[flag];
    }
    dirty = true;
}

function giveItem(item) {
    debug("giveItem(" + item + ")");
    state.inventory.push(item);
    dirty = true;
}

function takeItem(item) {
    debug("takeItem(" + item + ")");
    state.inventory.splice(state.inventory.indexOf(item), 1);
    dirty = true;
}

function removeObject(obj) {
    debug("removeObject(" + obj + ")");
    state.objects[state.room + '#' + obj] = false;
    dirty = true;
}

function handleAction(action) {
    console.log(action);
    // TODO random/sequence for multiple actions

    if (action.todo) {
        debug("TODO!! " + action.todo);
    }

    if (action.say) {
        say(action.say);
    }
    if (action.goto) {
        goto(action.goto);
    }
    if (action.setFlag) {
        setFlag(action.setFlag);
    }
    if (action.unsetFlag) {
        unsetFlag(action.unsetFlag);
    }
    if (action.flipFlag) {
        flipFlag(action.flipFlag);
    }
    if (action.giveItem) {
        giveItem(action.giveItem);
    }
    if (action.takeItem) {
        takeItem(action.takeItem);
    }
    if (action.removeObject) {
        removeObject(action.removeObject);
    }

    if (dirty) {
        showState();
    }

    // If we did any action unsed selected item.
    updateSelected(null);
}

function checkGuards(guards) {
    for (const guard of guards) {
        if (guard.flagFalse && guard.flagFalse in state.flags && state.flags[guard.flagFalse]) {
            return false;
        }
        if (guard.flagTrue && (!(guard.flagTrue in state.flags) || !state.flags[guard.flagTrue])) {
            return false;
        }
        if (guard.hasItem && state.inventory.indexOf(guard.hasItem) == -1) {
            return false;
        }
    }
    return true;
}

function handleClick(e) {
    const zone = findZone(e.layerX, e.layerY);
    if (zone == null) {
        return;
    }

    if (zone[0] == '#') {
        for (const action of game.rooms[state.room].actions) {
            if (action.trigger != zone) {
                continue;
            }
            if ((selectedItem != null && !action.item) || (action.item != selectedItem)) {
                continue;
            }
            if (action.guards && !checkGuards(action.guards)) {
                continue;
            }
            handleAction(action);
            break;
        }
        // TODO fallback action?
    } else {
        // TODO unify the logic with room actions, refactor "trigger"
        const obj = game.rooms[state.room].objects[zone];
        if (obj.actions) {
            for (const action of obj.actions) {
                if ((selectedItem != null && !action.item) || (action.item != selectedItem)) {
                    continue;
                }
                if (action.guards && !checkGuards(action.guards)) {
                    continue;
                }
                handleAction(action);
                break;
            }
        }
    }
}

function init() {
    const slider = document.getElementById('debug-zone-opacity');
    slider.onchange = (e) => {
        document.getElementById('zones').style.opacity = slider.value;
    };
    slider.value = 0.0;
    slider.onchange(null);

    const viewport = document.getElementById('viewport');
    viewport.onclick = handleClick;

    // TODO preload all images
    // TODO setup onclick handler on the whole canvas + inventory
    state = initialState();
    showState();
}

async function fetchGame() {
    const response = await fetch('./game.json');
    game = await response.json();
}

fetchGame().then(init);