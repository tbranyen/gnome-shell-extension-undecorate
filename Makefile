
submit:
	cd undecorate@tabdeveloper.com/ && gnome-extensions pack --force

install:
	gnome-extensions install --force ./undecorate@tabdeveloper.com/undecorate@tabdeveloper.com.shell-extension.zip
