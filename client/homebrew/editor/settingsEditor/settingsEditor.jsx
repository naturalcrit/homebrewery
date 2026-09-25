import '../uiEditor.less';
import React from 'react';

const SettingsEditor = ({ settings, updateSettings = ()=>{}, EditorThemeNameList })=>{

	const validations = {

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
			...settings,
			[setting] : e.target.type === 'number'
				? Number(value)
				: value,
		};

		updateSettings(updatedSettings);
	};

	return (
		<div className='settingsEditor uiEditor'>
			<h1>Editor Settings</h1>

			<div className='field'>
				<label htmlFor='changeEditorTheme'>
					Select your Editor Theme
				</label>
				<div className='value'>
					<select id='changeEditorTheme' value={settings.editorTheme} onChange={(e)=>handleFieldChange('editorTheme', e)} >
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
						checked={settings.autoCloseBrackets}
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
						checked={settings.showImagePreviews}
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
						checked={settings.activeLineShading}
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
						checked={settings.lineNumbers}
						onChange={(e)=>handleFieldChange('lineNumbers', e)}
					/>
				</div>
			</div>

			<div className='field'>
				<label htmlFor='fontSize'>
					Editor Font Size
				</label>

				<div className='value'>
					<small style={{ fontSize: `${settings.fontSize || 1}em` }}>from 7px to 26px</small>
					<input
						id='fontSize'
						type='range'
						min={.5}
						step={.1}
						max={2}
						list='font-sizes'
						name='fontSize'
						title={`${Math.round(settings.fontSize * 13)}px`}
						value={settings.fontSize || 1}
						onChange={(e)=>handleFieldChange('fontSize', e)}
					/>
					<datalist id='font-sizes'>
					<option value='1' />
					</datalist>

				</div>
			</div>
		</div>
	);
};

export default SettingsEditor;