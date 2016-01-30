TSC = $$NPM_PACKAGES/bin/tsc
ARGS = --module commonjs

sources = dist-matrix.ts
compiled = $(sources:%.ts=%.js)

all: $(compiled)

$(compiled): $(sources)
	$(TSC) $(ARGS) $^

clean:
	rm -rf *.js

