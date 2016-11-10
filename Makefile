BIN = $(realpath ./node_modules/.bin)
DIST_DIR = dist
SRC = $(notdir $(wildcard js/*.js))
TARGETS = $(addprefix $(DIST_DIR)/,$(SRC))
BUNDLE_ROOT = js/npm.js

cleanbundle = rm -f bundle.js bundle.js.map

.PHONY: all clean

all: $(TARGETS)
all: $(DIST_DIR)/shared-state-client.min.js $(DIST_DIR)/shared-state-client.min.js.map
all: Makefile

$(DIST_DIR):
	mkdir -p $@

$(DIST_DIR)/%.js: js/%.js | $(DIST_DIR)
	"$(BIN)"/babel --presets es2015 $< > $@

$(DIST_DIR)/shared-state-client.min.js $(DIST_DIR)/shared-state-client.min.js.map: $(TARGETS)

# Run the recipe for dummy.intermediate if either target is missing
$(DIST_DIR)/shared-state-client.min.js $(DIST_DIR)/shared-state-client.min.js.map: dummy.intermediate

# Make doesn't have an intuitive way to handle multiple targets
# Stack overflow has a solution:
# http://stackoverflow.com/questions/2973445/gnu-makefile-rule-generating-a-few-targets-from-a-single-source-file
# Targets that .INTERMEDIATE depends on are treated as intermediate files.
# This tells make that dummy.intermediate won't exist when make is run
# but its absence won't cause the recipe to be run spuriously.
.INTERMEDIATE: dummy.intermediate
dummy.intermediate: | $(DIST_DIR)
	"$(BIN)"/browserify $(BUNDLE_ROOT) --debug -t [ babelify --presets [es2015] ] | \
	"$(BIN)"/exorcist bundle.js.map > bundle.js
	"$(BIN)"/uglifyjs bundle.js --in-source-map bundle.js.map --source-map $(DIST_DIR)/shared-state-client.min.js.map \
	--source-map-url shared-state-client.min.js.map -o $(DIST_DIR)/shared-state-client.min.js -c
	$(cleanbundle)

clean:
	rm -fr $(DIST_DIR)
	$(cleanbundle)
