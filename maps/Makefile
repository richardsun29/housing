TSC = $$NPM_PACKAGES/bin/tsc
ARGS = --module commonjs

sources = dist-matrix.ts apt-list.ts
compiled = $(sources:%.ts=%.js)
d_ts = node.d.ts

all: $(d_ts) $(compiled)

$(d_ts):
	wget "https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/node/node.d.ts"

$(compiled): $(sources)
	$(TSC) $(ARGS) $^

run-map: dist-matrix.ts
	node dist-matrix.js

run-apt: apt-list.ts
	node apt-list.js

clean:
	rm -rf *.js

