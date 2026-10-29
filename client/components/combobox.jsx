import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import './combobox.less';

const Combobox = ({
	id          = '',
	className   = '',
	trigger     = 'hover',
	default: defaultValue = '',
	placeholder = '',
	tooltip     = '',
	autoSuggest = {
		clearAutoSuggestOnClick : true,
		suggestMethod           : 'includes',
		filterOn                : []  // should allow as array to filter on multiple attributes, or even custom filter
	},
	valuePatterns = /.+/,
	options,
	...props
})=>{
	const dropdownRef = useRef(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [inputFocused, setInputFocused] = useState(false);
	const [value, setValue] = useState(defaultValue);

	useEffect(()=>{
		if(trigger === 'click') {
			document.addEventListener('click', handleClickOutside);
			return ()=>document.removeEventListener('click', handleClickOutside);
		}
	}, []);

	const handleClickOutside = (e)=>{
		// Close dropdown when clicked outside
		if(!dropdownRef.current?.contains(e.target)) handleDropdown(false);
	};

	const handleDropdown = (show)=>{
		setValue(show ? '' : defaultValue);
		setShowDropdown(show);
		setInputFocused(autoSuggest.clearAutoSuggestOnClick ? show : false);
	};

	const handleInput = (e)=>{
		setValue(e.target.value);
		setInputFocused(false);
		props.onEntry(e);
	};

	const handleSelect = (value, data=value)=>{
		setValue(value);
		props.onSelect(data);
	};

	const renderTextInput = ()=>{
		return (
			<div className='dropdown-input item'
				onMouseEnter={trigger == 'hover' ? ()=>{handleDropdown(true);} : undefined}
				onClick=     {trigger == 'click' ? ()=>{handleDropdown(true);} : undefined}
				{...(tooltip ? { 'data-tooltip-right': tooltip } : {})}>
				<input
					id={id}
					type='text'
					onChange={(e)=>handleInput(e)}
					value={value || ''}
					title=''
					pattern={valuePatterns}
					placeholder={placeholder}
					onBlur={(e)=>{
						if(!e.target.checkValidity()){
							setValue(defaultValue);
						}
					}}
					onKeyDown={(e)=>{
						if(e.key === 'Enter') {
							e.preventDefault();
							props.onEntry(e);
						}
					}}
				/>
				<i className='fas fa-caret-down'/>
			</div>
		);
	};

	const renderDropdown = ()=>{
		if(!showDropdown) return null;
		const dropdownChildren = options.map((child, i)=>{
			const clone = React.cloneElement(child, { onClick: ()=>handleSelect(child.props.value, child.props.data) });
			return clone;
		});
		if(autoSuggest && !inputFocused){
			const suggestMethod = autoSuggest.suggestMethod;
			const filterOn = _.isString(autoSuggest.filterOn) ? [autoSuggest.filterOn] : autoSuggest.filterOn;
			const filteredArrays = filterOn.map((attr)=>{
				const children = dropdownChildren.filter((item)=>{
					if(suggestMethod === 'includes')
						return item.props[attr]?.toLowerCase().includes(value.toLowerCase());
					if(suggestMethod === 'startsWith')
						return item.props[attr]?.toLowerCase().startsWith(value.toLowerCase());
				});
				return children;
			});
			dropdownChildren = _.uniq(filteredArrays.flat(1));
		}
		return (
			<div className='dropdown-options'>
				{dropdownChildren}
			</div>
		);
	};

	return (
		<div className={`dropdown-container ${className}`}
			ref={dropdownRef}
			onMouseLeave={trigger == 'hover' ? ()=>{handleDropdown(false);} : undefined}>
			{renderTextInput()}
			{renderDropdown()}
		</div>
	);

};

export default Combobox;
