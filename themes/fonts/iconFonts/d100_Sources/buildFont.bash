#!/bin/bash -x

# If there is no argument, don't recreate the individual dice, only run the final conversion.
if [ "${1}" == "y" ] || [ "${1}" == "n" ]; then
	if [ ! -d './rendered-files' ]; then 
		mkdir rendered-files 
	fi
	rm ./rendered-files/*.svg
	# Build 00-99 ( leading zeros )
	for tens in $(echo 0 1 2 3 4 5 6 7 8 9); do 
		for ones in $(echo 0 1 2 3 4 5 6 7 8 9); do 
			num=$(echo ${tens}${ones}); 
			cat d10-MASTER.svg | sed "s/AAAAA/${num}/" > ./rendered-files/10-MASTER-${num}.svg
			printf "Rendering d100 - ${num}\r"
			# Tweak the individual die
			if [ "${1}" == "y" ]; then inkscape ./rendered-files/10-MASTER-${num}.svg; fi
		done
	done
	# Build 0-9, non-leading zero
	for ones in $(echo 0 1 2 3 4 5 6 7 8 9); do 
		num=$(echo ${ones}); 
		cat d10-MASTER.svg | sed "s/AAAAA/${num}/" > ./rendered-files/10-MASTER-${num}.svg
		printf "Rendering d10 - ${num}\r"
		# Tweak the individual die
		if [ "${1}" == "y" ]; then inkscape ./rendered-files/10-MASTER-${num}.svg; fi
	done
	# Build the 100 ace
	num=100
	cat d10-MASTER.svg | sed "s/AAAAA/${num}/" > ./rendered-files/10-MASTER-${num}.svg
	printf "Rendering d100 - ${num}\r"
	# Tweak the individual die
	if [ "${1}" == "y" ]; then inkscape ./rendered-files/10-MASTER-${num}.svg; fi
	printf "\r\n"
fi

# Convert the Master files for better IcoMoon compatibility
# Mirror this literally
for tens in $(echo 0 1 2 3 4 5 6 7 8 9); do 
	for ones in $(echo 0 1 2 3 4 5 6 7 8 9); do 
		num=$(echo ${tens}${ones})
		inkscape --export-text-to-path  -o ./rendered-files/dpercent-${num}.svg ./rendered-files/10-MASTER-${num}.svg 2> /dev/null
		printf "Rewriting d100 - ${num}\r"
	done
done

# d100
num=100
inkscape --export-text-to-path  -o ./rendered-files/dpercent-${num}.svg ./rendered-files/10-MASTER-${num}.svg 2> /dev/null
printf "Rewriting d100 - ${num}\r"

for ones in $(echo 0 1 2 3 4 5 6 7 8 9); do 
	num=$(echo ${ones}) 
	inkscape --export-text-to-path  -o ./rendered-files/d10-${num}.svg ./rendered-files/10-MASTER-${num}.svg 2> /dev/null
	printf "Rewriting d10 - ${num}\r"
done	

# Duplicate the 10 for the d10 set
num=10
inkscape --export-text-to-path  -o ./rendered-files/d10-${num}.svg ./rendered-files/10-MASTER-${num}.svg 2> /dev/null
printf "Rewriting d10 - ${num}\r"

# Run svgfixer
if [ ! -d './fixed-files' ]; then 
	mkdir fixed-files 
fi

rm ./fixed-files/*.svg
oslllo-svg-fixer -s ./rendered-files/ -d ./fixed-files
