// Forked from sunwxg/gnome-shell-extension-undecorate
// Apps preferences handling borrowed from https://github.com/eonpatapon/gnome-shell-extension-
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as WindowMenu from 'resource:///org/gnome/shell/ui/windowMenu.js';
import { Extension, InjectionManager, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';


let windowCreatedId;

export default class UndecorateExtension extends Extension {
    enable() {
        // Overwrite the buildMenu method to hook our menu item into.
        this._injectionManager = new InjectionManager();
        this._injectionManager.overrideMethod(WindowMenu.WindowMenu.prototype, '_buildMenu',
        old_buildMenu => {
                return function (...args) {
                    old_buildMenu.call(this, ...args);
                    newBuildMenu.call(this, ...args)
                }
            })

        const settings = this.getSettings();
        windowCreatedId = global.display.connect('window-created', (_, window) => {
            // Automatically set this window up      
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

    disable() {
        this._injectionManager.clear();
        this._injectionManager = null;
        global.display.disconnect(windowCreatedId);
    }
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
      this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      let item = {};
      if (window.decorated) {
          item = this.addAction(_('Undecorate'), event => {
              undecorate(window);
              windowGetFocus(window);
          });
      } else {
          item = this.addAction(_('Decorate'), event => {
              decorate(window);
              windowGetFocus(window);
          });
      }
      if (window.get_window_type() == Meta.WindowType.DESKTOP) {
          item.setSensitive(false);
      }

  }
