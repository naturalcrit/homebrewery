# Dicefont extensions

This folder is setup for building/rebuilding the d10 and d100 (percent representation on a d10 shape) for use with Icomoon. This will, presumably, be a usable workflow with similar tools.

## Overview

This script uses the file 10-MASTER.svg as a base, loops through each of the die face numbers needed, creating an SVG per face in `./rendered-files`. Next, it post-processes the files from `./rendered-files/` to be more compatible with IcoMoon and places the results in `./fixed-files`.

## Usage

The script runs on three possible paths.

1. Start from scratch ***and*** open inkscape for each glyph for tweaking.
	`bash ./buildFont.bash y`

	On this path, the per-face SVG files are generated and Inkscape is opened on each file for any tweaking to be done.

2. Start from scratch but ***do not*** tweak each glyph while running.
	`bash ./buildFont.bash n`

3. Process the rendered glyphs for loading into IcoMoon
	`bash ./buildFont.bash`

For most rebuilds, the expectation is that the script will be run once with `n` as the parameter, then some number of files will be manually touched, then the script re-run with no parameters before finally using the results with IcoMoon.

## Requirements

This script expects inkscape and [https://docs-oslllo-com.onrender.com/svg-fixer/master/#/getting-started/introduction](svgFixer) to be in the path. The numbering uses the Kremlin Minister Font Family.