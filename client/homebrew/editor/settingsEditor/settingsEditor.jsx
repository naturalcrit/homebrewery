import '../uiEditor.less';
import React, { useState } from 'react';

const SettingsEditor = ({ settings, updateSettings = ()=>{}, EditorThemeNameList })=>{
	const [currentSettings, setCurrentSettings] = useState(settings);

	const validations = {
		fontSize : [
			(value)=>{
				const number = Number(value);

				if(number < 9 || number > 30) {
					return 'Font size must be between 9 and 30.';
				}

				return null;
			},
		],
	};

	const handleFieldChange = (setting, e)=>{
		const value =
			e.target.type === 'checkbox'
				? e.target.checked
				: e.target.value;

		const inputRules = validations[setting] ?? [];

		const validationErrors = inputRules
			.map((rule)=>rule(value))
			.filter(Boolean);

		if(validationErrors.length > 0) {
			e.target.setCustomValidity(validationErrors.join('\n'));
			e.target.reportValidity();
			return;
		}

		e.target.setCustomValidity('');

		const updatedSettings = {
			...currentSettings,
			[setting] : e.target.type === 'number'
				? Number(value)
				: value,
		};

		setCurrentSettings(updatedSettings);
		updateSettings(updatedSettings);
	};

	return (
		<div className='settingsEditor ui-editor'>
			<h1>Editor Settings</h1>

			<div className='field'>
				<label htmlFor='changeEditorTheme'>
					Select your Editor Theme
				</label>
				<div className='value'>
					<select value={currentSettings.editorTheme} onChange={(e)=>handleFieldChange('editorTheme', e)} >
						{EditorThemeNameList.map((theme, key)=>{
							return <option key={key} value={theme}>{theme}</option>;
						})}
					</select>
				</div>
			</div>

			<div className='field'>
				<label htmlFor='autoCloseBrackets'>
					Automatically close brackets
				</label>
				<div className='value'>
					<input
						id='autoCloseBrackets'
						type='checkbox'
						name='autoCloseBrackets'
						checked={currentSettings.autoCloseBrackets}
						onChange={(e)=>handleFieldChange('autoCloseBrackets', e)}
					/>
				</div>
			</div>

			<div className='field'>
				<label htmlFor='showImagePreviews'>
					Show Image Previews when hovering a link
				</label>
				<div className='value'>
					<input
						id='showImagePreviews'
						type='checkbox'
						name='showImagePreviews'
						checked={currentSettings.showImagePreviews}
						onChange={(e)=>handleFieldChange('showImagePreviews', e)}
					/>
				</div>
			</div>

			<div className='field'>
				<label htmlFor='activeLineShading'>
					Background shading of active line
				</label>
				<div className='value'>
					<input
						id='activeLineShading'
						type='checkbox'
						name='activeLineShading'
						checked={currentSettings.activeLineShading}
						onChange={(e)=>handleFieldChange('activeLineShading', e)}
					/>
				</div>

			</div>

			<div className='field'>
				<label htmlFor='lineNumbers'>Show Line Numbers</label>
				<div className='value'>
					<input
						id='lineNumbers'
						type='checkbox'
						name='lineNumbers'
						checked={currentSettings.lineNumbers}
						onChange={(e)=>handleFieldChange('lineNumbers', e)}
					/>
				</div>
			</div>

			<div className='field'>
				<label htmlFor='fontSize'>
					Editor Font Size
				</label>
				
				<div className='value'>
					<small>from 9px to 30px</small>
					<input
						id='fontSize'
						type='number'
						min={9}
						max={30}
						name='fontSize'
						value={currentSettings.fontSize}
						onChange={(e)=>handleFieldChange('fontSize', e)}
					/>
				</div>
			</div>
		</div>
	);
};

export default SettingsEditor;