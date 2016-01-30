TSC = $$NPM_PACKAGES/bin/tsc
ARGS = --module commonjs

sources = dist-matrix.ts apt-list.ts
compiled = $(sources:%.ts=%.js)
d_ts = node.d.ts

all: $(d_ts) $(compiled)

$(d_ts):
	wget "https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/node/node.d.ts"

%.js: %.ts
	$(TSC) $(ARGS) $^

run-apt: apt-list.js
	node apt-list.js

run-map: dist-matrix.js apartments.json
	node dist-matrix.js

apartments.json: run-apt

clean:
	rm -rf *.js

