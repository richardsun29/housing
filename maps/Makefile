TSC = $$NPM_PACKAGES/bin/tsc
ARGS = --module commonjs

programs = apt-list dist-matrix coords
sources  = $(programs:%=%.ts)
compiled = $(programs:%=%.js)
d_ts = node.d.ts

all: $(d_ts) $(compiled)

$(d_ts):
	wget "https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/node/node.d.ts"

%.js: %.ts
	$(TSC) $(ARGS) $^

$(programs): % : %.js
	node $@.js


APTS = apartments.json

$(APTS): apt-list
dist-matrix coords: $(APTS)

clean:
	rm -rf *.js

