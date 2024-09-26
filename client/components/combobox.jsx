require('./combobox.less');
import React, { useState, useRef, useEffect } from 'react';
const _ = require('lodash');

const Combobox = ({ autoSuggest = { filterOn: ['data-value'] }, ...props }) => {
	const [inputValue, setInputValue] = useState(props.value || '');
	const [showDropdown, setShowDropdown] = useState(false);
	const [inputFocused, setInputFocused] = useState(false);
	const [currentOption, setCurrentOption] = useState(-1);
	const [filteredOptions, setFilteredOptions] = useState([]);
	const optionRefs = useRef([]);
	const componentRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (evt) => {
			if (showDropdown && componentRef.current && !componentRef.current.contains(evt.target)) {
				setShowDropdown(false);
			}
		};
		
		document.addEventListener('pointerdown', handleClickOutside);

		return () => {
			document.removeEventListener('pointerdown', handleClickOutside);
		};
	}, [showDropdown]);

	useEffect(() => {
		props.onSelect(inputValue);
	
		handleInputChange({ target: { value: inputValue } });
	}, [inputValue]);

	useEffect(() => {
		if (currentOption >= 0 && optionRefs.current[currentOption] && optionRefs.current[currentOption].focus) {
			optionRefs.current[currentOption].focus();
		}
	}, [currentOption]);

	const handleInputChange = (evt) => {
		const newValue = evt.target.value;
		setInputValue(newValue);
		setCurrentOption(-1);

		const filtered = React.Children.toArray(props.children).filter((option) => {
			return autoSuggest.filterOn.some((filterAttr) => {
				return option.props[filterAttr]?.toLowerCase().startsWith(newValue.toLowerCase());
			});
		});
		setFilteredOptions(filtered);
	}

	// Handle keyboard navigation
	const handleKeyDown = (evt) => {
		if (inputFocused || (currentOption >= 0)) {
			const optionsLength = filteredOptions.length;
			// ArrowDown moves to the next option
			if (evt.key === 'ArrowDown') {
				evt.preventDefault();
				const nextIndex = currentOption + 1;
				if (nextIndex < optionsLength) {
					setCurrentOption(nextIndex);
				} else {
					setCurrentOption(0);
				}
			}
			// ArrowUp moves to the previous option
			else if (evt.key === 'ArrowUp') {
				evt.preventDefault();
				const prevIndex = currentOption - 1;
				if (prevIndex >= 0) {
					setCurrentOption(prevIndex);
				} else {
					setCurrentOption(optionsLength - 1);
				}
			}
		}
	}

	const handleOptionClick = (evt) => {
		setShowDropdown(false);
		setInputValue(evt.currentTarget.dataset.value);
	}

	// Render the filtered options
	const renderChildren = () => {
		optionRefs.current = []; // Reset refs for each render cycle

		// Add refs and event handlers for filtered options
		return filteredOptions.map((child, i) => {
			return React.cloneElement(child, {
				onClick: (evt) => handleOptionClick(evt),
				onKeyDown: (evt) => handleKeyDown(evt),
				ref: (node) => { optionRefs.current[i] = node; },
				tabIndex: -1,
			});
		});
	}



	return (
		<div className="combobox" ref={componentRef}>
			<input
				type="text"
				value={inputValue}
				onClick={() => {
					setShowDropdown(true);
					setInputFocused(true);
				}}
				onChange={(evt) => handleInputChange(evt)}
				onKeyDown={(evt) => handleKeyDown(evt)}
			/>
			<div className={`dropdown-options${showDropdown ? ' open' : ''}`}>
				{renderChildren()}
			</div>
		</div>
	);
}

module.exports = Combobox;
