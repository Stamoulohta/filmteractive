S_ENC = jq

M_ENC = ./bin/mkdmx
V_ENC = ffmpeg
V_ENC_FLAGS = -c:v libx264 -crf 18 -preset veryslow -pix_fmt yuv420p # prod
#V_ENC_FLAGS = -c:v libx264 -crf 18 -preset ultrafast -pix_fmt yuv420p # dev
A_ENC_FLAGS = -c:a copy # -af "afade=t=in:st=0:d=1,afade=t=out:st=-1:d=1" --shortest
EXT_OUT = mp4

RM = rm -rf

SIZES = 360 #1080 720 360
SCENE_MAKE = config.mk
SCENE_JSON = scene.json
SCENE_DMX  = input.dmx
SCENE_AUDIO = audio

DIR_IN = assets_pic
DIR_OUT = public

SCENARIO_OUT = scenario.json
SCENARIO_IN = template.json

DEPENDENCIES = $(S_ENC) $(V_ENC)

EXT_AUDIO = m4a mp3
EXT_IMAGE = png

QUALIFIERS_OUT = $(addprefix $(DIR_OUT)/, $(SIZES))

SCENES_OUT = $(foreach SIZE_DIR, $(QUALIFIERS_OUT), $(subst $(DIR_IN), $(SIZE_DIR), $(addsuffix .$(EXT_OUT), $(wildcard $(DIR_IN)/*))))
SCENES_OUT_PATTERN = $(addsuffix /%.$(EXT_OUT), $(QUALIFIERS_OUT))

SCENES_DMX_PATTERN = $(DIR_IN)/%/$(SCENE_DMX)

ifneq (,$(wildcard $(SCENARIO_OUT)))
    SCENARIO_IN = $(SCENARIO_OUT)
endif

define configure
	FPS = 10
	EXT_IN = png
	undefine DURATION
	undefine DURATIONS

	include $(1)/$(SCENE_MAKE)
endef

all : $(DEPENDENCIES) $(SCENES_OUT) $(SCENARIO_OUT)

$(SCENARIO_OUT) : $(wildcard $(DIR_IN)/*/$(SCENE_JSON))
	$(eval $@_BUFFER = $(shell mktemp))
	jq -s ".[1].scenes += .[0] | .[1]" <(jq -s 'transpose | map( {(.[0]): .[1]} ) | add' <(echo -n $(subst $(DIR_IN)/,,$(?D)) | jq -R -s -c 'split(" ")') <(jq -s '.' $?)) $(SCENARIO_IN) > $($@_BUFFER)
	jq -s '.[1].sizes = .[0] | .[1]' <(echo -n $(SIZES) | jq -R -s -c 'split(" ")') $($@_BUFFER) > $(SCENARIO_OUT)
	$(RM) $($@_BUFFER)

$(SCENES_OUT_PATTERN) &: $(SCENES_DMX_PATTERN) | $(QUALIFIERS_OUT)
	$(eval AUDIO_INPUT =  $(if $(wildcard $(addprefix $(<D)/$(SCENE_AUDIO)., $(EXT_AUDIO))), -i $(firstword $(wildcard $(addprefix $(<D)/$(SCENE_AUDIO)., $(EXT_AUDIO))))))
	$(V_ENC) -y -f concat -i "$(<D)/$(SCENE_DMX)" $(AUDIO_INPUT) $(foreach HEIGHT, $(SIZES), -vf scale=-1:$(HEIGHT) $(V_ENC_FLAGS) $(if $(AUDIO_INPUT), $(A_ENC_FLAGS)) $(DIR_OUT)/$(HEIGHT)/$*.$(EXT_OUT))

$(SCENES_DMX_PATTERN) : $(DIR_IN)/%/$(SCENE_MAKE) $(DIR_IN)/%/*.$(EXT_IMAGE)
	$(eval $(call configure, $(<D)))
	$(M_ENC) $(if $(DURATION), -d $(DURATION), -r $(FPS)) -e $(EXT_IN) -o $(SCENE_DMX) $(addprefix -f , $(DURATIONS)) $(<D)

$(DEPENDENCIES) :
	$(foreach DEPENDENCY, $(DEPENDENCIES), $(if $(shell command -v $(DEPENDENCY)),,$(error "No $(DEPENDENCY) in $$PATH")))

$(QUALIFIERS_OUT) :
	mkdir -p $(QUALIFIERS_OUT)

clean :
	$(RM) $(foreach OUT_SIZE, $(addprefix $(DIR_OUT)/, $(SIZES)), $(wildcard $(OUT_SIZE))) $(wildcard $(SCENARIO_OUT)) $(wildcard $(DIR_IN)/*/$(SCENE_DMX))

.PHONY : clean $(DEPENDENCIES)
.PRECIOUS : $(SCENES_DMX_PATTERN)
