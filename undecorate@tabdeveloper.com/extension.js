// Forked from sunwxg/gnome-shell-extension-undecorate
const Lang = imports.lang;
const { GLib, Meta } = imports.gi;
const PopupMenu = imports.ui.popupMenu;
const WindowMenu = imports.ui.windowMenu.WindowMenu;

const buildMenus = {
  old: WindowMenu.prototype._buildMenu,
};

// Cache the incoming `_buildMenu` class, to hook into.
function init() {
    buildMenus.old = WindowMenu.prototype._buildMenu;
}

// Overwrite the buildMenu method to hook our menu item into.
function enable() {
    WindowMenu.prototype._buildMenu = buildMenus.new;
}

// Return to the original class method.
function disable() {
    WindowMenu.prototype._buildMenu = buildMenus.old;
}

// Cannot use an arrow function here, as the function will be treated as a
// class method when invoked and we rely on `this`.
buildMenuStates.new = function(window) {
    let old = Lang.bind(this, old_buildMenu);
    old(window);

    this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    let item = {};
    if (window.decorated) {
        item = this.addAction(_('Undecorate'), Lang.bind(this, event => {
            undecorate(window);
            windowGetFocus(window);
        }));
    } else {
        item = this.addAction(_('Decorate'), Lang.bind(this, event => {
            decorate(window);
            windowGetFocus(window);
        }));
    }
    if (window.get_window_type() == Meta.WindowType.DESKTOP)
        item.setSensitive(false);
};

function undecorate(window) {
    try {
        GLib.spawn_command_line_sync('xprop -id ' + activeWindowId(window)
            + ' -f _MOTIF_WM_HINTS 32c -set'
            + ' _MOTIF_WM_HINTS "0x2, 0x0, 0x0, 0x0, 0x0"');
    } catch(e) {
        log(e);
    }
}

function decorate(window) {
    try {
        GLib.spawn_command_line_sync('xprop -id ' + activeWindowId(window)
            + ' -f _MOTIF_WM_HINTS 32c -set'
            + ' _MOTIF_WM_HINTS "0x2, 0x0, 0x1, 0x0, 0x0"');
    } catch(e) {
        log(e);
    }
}

function activeWindowId(window) {
    try {
        return parseInt(window.get_description(), 16);
    } catch(e) {
        log(e);
        return;
    }
}

function windowGetFocus(window) {
    Meta.later_add(Meta.LaterType.IDLE, () => {
        if (window.focus) {
            window.focus(global.get_current_time());
        } else {
            window.activate(global.get_current_time());
        }
    });
}

