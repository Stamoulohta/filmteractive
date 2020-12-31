S_ENC = jq

V_ENC = ffmpeg
V_ENC_FLAGS = -c:v libx264 -crf 18 -preset veryslow -pix_fmt yuv420p
EXT_OUT = .mp4

RM = rm -rf

SIZES = 1080 720 360
SCENE_MAKE = config.mk
SCENE_JSON = scene.json

DIR_IN = assets
DIR_OUT = public

SCENARIO_OUT = scenario.json
SCENARIO_IN = template.json

DEPENDENCIES = $(S_ENC) $(V_ENC)

EXT_VALID = .png

QUALIFIERS_OUT = $(addprefix $(DIR_OUT)/, $(SIZES))
SCENES_OUT = $(foreach size_dir, $(QUALIFIERS_OUT), $(subst $(DIR_IN), $(size_dir), $(addsuffix $(EXT_OUT), $(wildcard $(DIR_IN)/*))))
SCENES_PATTERN = $(addsuffix /%$(EXT_OUT), $(QUALIFIERS_OUT))


ifneq (,$(wildcard $(SCENARIO_OUT)))
    SCENARIO_IN = $(SCENARIO_OUT)
endif

define configure
	FPS = 10
	EXT_IN = .png

	include $(1)/$(SCENE_MAKE)
endef

all: $(DEPENDENCIES) $(QUALIFIERS_OUT) $(SCENES_OUT) $(SCENARIO_OUT)

$(SCENARIO_OUT) : $(wildcard $(DIR_IN)/*/$(SCENE_JSON))
	$(eval $@_BUFFER = $(shell mktemp))
	jq -s ".[1].scenes += .[0] | .[1]" <(jq -s 'transpose | map( {(.[0]): .[1]} ) | add' <(echo -n $(subst $(DIR_IN)/,,$(?D)) | jq -R -s -c 'split(" ")') <(jq -s '.' $?)) $(SCENARIO_IN) > $($@_BUFFER)
	jq -s '.[1].sizes = .[0] | .[1]' <(echo -n $(SIZES) | jq -R -s -c 'split(" ")') $($@_BUFFER) > $(SCENARIO_OUT)
	$(RM) $($@_BUFFER)

$(SCENES_PATTERN) &: $(foreach EXT, $(EXT_VALID), $(wildcard $(DIR_IN)/%/*$(EXT))) $(DIR_IN)/%/$(SCENE_MAKE)
	$(eval $(call configure, $(<D)))
	$(V_ENC) -y -framerate $(FPS) -pattern_type glob -i "$(<D)/*$(EXT_IN)" $(foreach HEIGHT, $(SIZES), -vf scale=-1:$(HEIGHT) $(V_ENC_FLAGS) $(DIR_OUT)/$(HEIGHT)/$*$(EXT_OUT))

$(DEPENDENCIES):
	$(foreach DEPENDENCY, $(DEPENDENCIES), $(if $(shell command -v $(DEPENDENCY)),,$(error "No $(DEPENDENCY) in $$PATH")))

$(QUALIFIERS_OUT):
	mkdir -p $(QUALIFIERS_OUT)
	touch $(wildcard $(DIR_IN)/*/$(SCENE_MAKE))

clean:
	$(RM) $(DIR_OUT) $(SCENARIO_OUT)

.PHONY: clean $(DEPENDENCIES)
