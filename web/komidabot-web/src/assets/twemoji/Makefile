INPUT_FILES = $(basename $(shell find . -name '*.svg'))

.PHONE: all
all: $(addsuffix .png, $(INPUT_FILES))

%.png: %.svg
	inkscape -z -e $@ -w 72 -h 72 $<
