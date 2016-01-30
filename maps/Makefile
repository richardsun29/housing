TSC = $$NPM_PACKAGES/bin/tsc
ARGS = --module commonjs

sources = dist-matrix.ts
compiled = $(sources:%.ts=%.js)
d_ts = node.d.ts

all: $(d_ts) $(compiled)

$(d_ts):
	wget "https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/node/node.d.ts"

$(compiled): $(sources)
	$(TSC) $(ARGS) $^

run: $(compiled)
	node dist-matrix.js

clean:
	rm -rf *.js

