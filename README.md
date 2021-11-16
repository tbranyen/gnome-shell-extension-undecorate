# Undecorate Windows Extension

Adds a new option to Window menus to toggle window decoration. When decorations
are removed, use `[alt]+[space]` keys to show the window menu again.

You can set default applications to automatically remove window decoration.

Since you cannot easily resize windows without decoration, you should enable
the resize-with-right-button drag feature. This will allow you to right click
to drag resize while holding the `[meta]` key.

Run the following to enable this:

```
gsettings set org.gnome.desktop.wm.preferences resize-with-right-button true
```

Supports Wayland!

![screenshot](/Screenshot_altspace.png)

## Acknowledgements

Forked from https://github.com/sunwxg/gnome-shell-extension-undecorate
