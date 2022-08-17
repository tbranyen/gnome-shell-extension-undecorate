// Forked from sunwxg/gnome-shell-extension-undecorate
// Apps preferences handling borrowed from https://github.com/eonpatapon/gnome-shell-extension-
const Lang = imports.lang;
const { Shell, GLib, Meta } = imports.gi;
const PopupMenu = imports.ui.popupMenu;
const WindowMenu = imports.ui.windowMenu.WindowMenu;
const ExtensionUtils = imports.misc.extensionUtils;

let old_buildMenu;
let windowCreatedId;

function init() {
    // Cache the incoming `_buildMenu` class, to hook into.
    old_buildMenu = WindowMenu.prototype._buildMenu;
}

// Overwrite the buildMenu method to hook our menu item into.
function enable() {
    WindowMenu.prototype._buildMenu = newBuildMenu;

    windowCreatedId = global.display.connect('window-created', (_, window) => {
      // Automatically set this window up
      const settings = ExtensionUtils.getSettings();

      // Set defaults
      let done = false;
      const appSystem = Shell.AppSystem.get_default();

      settings.get_strv('inhibit-apps').forEach(appId => {
        //const window = global.display.focus_window;
        if (done) {
          return;
        }

        const app = appSystem.lookup_app(appId);

        if (app.get_windows().includes(window)) {
          undecorate(window);
          windowGetFocus(window);
          done = true;
        }
      });
    });
}

// Return to the original class method.
function disable() {
    WindowMenu.prototype._buildMenu = old_buildMenu;

    global.display.disconnect(windowCreatedId);
}

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
    Meta.later_add(Meta.LaterType.IDLE, function() {
        if (window.focus) {
            window.focus(global.get_current_time());
        } else {
            window.activate(global.get_current_time());
        }
    });
}

// Cannot use an arrow function here, as the function will be treated as a
// class method when invoked and we rely on `this`.
function newBuildMenu(window) {
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
      if (window.get_window_type() == Meta.WindowType.DESKTOP) {
          item.setSensitive(false);
      }

  }
