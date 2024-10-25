require('./combobox.less');
import React, { useState, useRef, useEffect } from 'react';
const _ = require('lodash');

	const [inputValue, setInputValue] = useState(props.value || '');
const Combobox = (props)=>{
	props = {
		id          : null,
		onSelect    : ()=>{},
		multiSelect : false,
		autoSuggest : {
			filterOn                : ['data-value'],
			suggestMethod           : 'includes',
			clearAutoSuggestOnClick : false
		},
		...props
	};

	const [showDropdown, setShowDropdown] = useState(false);
	const [inputFocused, setInputFocused] = useState(false);
	const [currentOption, setCurrentOption] = useState(-1);
	const [filteredOptions, setFilteredOptions] = useState(React.Children.toArray(props.children));
	const inputRef = useRef(null);
	const optionRefs = useRef([]);
	const componentRef = useRef(null);

	useEffect(()=>{
		document.addEventListener('pointerdown', handleClickOutside);
		return ()=>{document.removeEventListener('pointerdown', handleClickOutside);};
	}, []);

	useEffect(()=>{
		props.onSelect(inputValue);
		// handleInputChange({ target: { value: inputValue } });
	}, [inputValue]);

	useEffect(()=>{
		if(currentOption >= 0 && optionRefs.current[currentOption]) {
			optionRefs.current[currentOption].focus();
		}
	}, [currentOption]);


	const handleClickOutside = (evt)=>{
		console.log(componentRef.current, showDropdown)
		if(componentRef.current && !componentRef.current.contains(evt.target)) {
			setShowDropdown(false);
		}
	};

	const handleInputChange = (evt)=>{
		const newValue = evt.target.value;
		setInputValue(newValue);
		setCurrentOption(-1);

		const filtered = React.Children.toArray(props.children).filter((option)=>{
			return props.autoSuggest.filterOn.some((filterAttr)=>{
				return option.props[filterAttr]?.toLowerCase().startsWith(newValue.toLowerCase());
			});
		});
		setFilteredOptions(filtered);
	};

	/* eslint-disable brace-style */

	// Handle keyboard navigation
	const handleKeyDown = (evt)=>{
		const modifiers = ['Meta', 'Shift', 'Alt', 'Control', 'Tab'];
		if(inputFocused || (currentOption >= 0)) {
			const optionsLength = filteredOptions.length;

			if(evt.key === ' ' && (inputValue === '' || (inputRef.current.selectionStart === 0 && inputRef.current.selectionEnd === inputValue.length))){
				evt.preventDefault();
				setShowDropdown(!showDropdown);
			}

			// ArrowDown moves to the next option
			else if(evt.key === 'ArrowDown') {
				evt.preventDefault();
				if((currentOption === -1) && (showDropdown === false)){
					setShowDropdown(true);
				};
				const nextIndex = currentOption + 1;
				if(nextIndex < optionsLength) {
					setCurrentOption(nextIndex);
				} else {
					setCurrentOption(0);
				}
			}

			// ArrowUp moves to the previous option
			else if(evt.key === 'ArrowUp') {
				evt.preventDefault();
				const prevIndex = currentOption - 1;
				if(prevIndex >= 0) {
					setCurrentOption(prevIndex);
				} else {
					setCurrentOption(-1);
					inputRef.current.focus();
				}
			}

			// Escape key closes the dropdown
			else if(evt.key === 'Escape'){
				setCurrentOption(-1);
				inputRef.current.focus();
				setShowDropdown(false);
			}

			// Backspace key while menu is open still deletes characters in input
			else if((evt.key === 'Backspace') && showDropdown){
				inputRef.current.focus();
			}

			else if((evt.key === 'Tab')){
				setCurrentOption(-1);
				setShowDropdown(false);
			}

			// Prevent modifier keys from triggering dropdown (example, shift+tab or tab to move focus)
			else if(!modifiers.includes(evt.key)) {
				setShowDropdown(true);
			}
		}


	};
	/* eslint-enable brace-style */

	const handleOptionClick = (evt)=>{
		setInputValue(evt.currentTarget.dataset.value);
	};

	// Render the filtered options
	const renderChildren = ()=>{
		optionRefs.current = []; // Reset refs for each render cycle

		if(filteredOptions.length < 1){
			return <span className='no-matches'>no matches</span>;
		} else {
			// Add refs and event handlers for filtered options
			return filteredOptions.map((child, i)=>{
				return React.cloneElement(child, {
					onClick   : (evt)=>handleOptionClick(evt),
					onKeyDown : (evt)=>handleKeyDown(evt),
					ref       : (node)=>{ optionRefs.current[i] = node; },
					tabIndex  : -1,
					role      : 'option'
				});
			});

		}
	};

	return (
		<div id={props.id} className='combobox' ref={componentRef}>
			<input
				id={`${props.id}-input`}
				type='text'
				role='combobox'
				aria-controls={`${props.id}-menu`}
				aria-expanded={showDropdown ? true : false}
				ref={inputRef}
				value={inputValue}
				placeholder={props.placeholder}
				onClick={()=>{
					setShowDropdown(true);
					setInputFocused(true);
					props.autoSuggest.clearAutoSuggestOnClick && setInputValue([]);
				}}
				onChange={(evt)=>handleInputChange(evt)}
				onKeyDown={(evt)=>handleKeyDown(evt)}
				onFocus={()=>{setInputFocused(true);}}
				onBlur={()=>{
					setInputFocused(false);
				}}
			/>
			<button tabIndex={-1} onClick={()=>setShowDropdown(!showDropdown)} aria-controls={`${props.id}-menu`} aria-expanded={showDropdown ? true : false}><i className='fas fa-caret-down' /></button>
			<div id={`${props.id}-menu`} className={`dropdown-options${showDropdown ? ' open' : ''}`} role='listbox'>
				{renderChildren()}
			</div>
		</div>
	);
};

module.exports = Combobox;
