import './settingsEditor.less';
import React, { useState } from 'react';

const SettingsEditor = ({settings, updateSettings = () => {} }) => {
	const [currentSettings, setCurrentSettings] = useState(settings);

	const validations = {
		fontSize: [
			(value) => {
				const number = Number(value);

				if (number < 9 || number > 30) {
					return 'Font size must be between 9 and 30.';
				}

				return null;
			},
		],
	};

	const handleFieldChange = (setting, e) => {
		const value =
			e.target.type === 'checkbox'
				? e.target.checked
				: e.target.value;

		const inputRules = validations[setting] ?? [];

		const validationErrors = inputRules
			.map((rule) => rule(value))
			.filter(Boolean);

		if (validationErrors.length > 0) {
			e.target.setCustomValidity(validationErrors.join('\n'));
			e.target.reportValidity();
			return;
		}

		e.target.setCustomValidity('');

		const updatedSettings = {
			...currentSettings,
			[setting]: e.target.type === 'number'
				? Number(value)
				: value,
		};

		setCurrentSettings(updatedSettings);
		updateSettings(updatedSettings);
	};

	return (
		<div className='settingsEditor'>
			<h1>Editor Settings</h1>
{/* 
			<div className='field title'>
				<label htmlFor='blockShading'>
					Background Shading of blocks in editor
				</label>
				<input
					id='blockShading'
					type='checkbox'
					name='blockShading'
					checked={currentSettings.blockShading}
					onChange={(e) => handleFieldChange('blockShading', e)}
				/>
			</div> */}

			<div className='field title'>
				<label htmlFor='autoCloseBrackets'>
					Automatically close brackets
				</label>
				<input
					id='autoCloseBrackets'
					type='checkbox'
					name='autoCloseBrackets'
					checked={currentSettings.autoCloseBrackets}
					onChange={(e) => handleFieldChange('autoCloseBrackets', e)}
				/>
			</div>

			<div className='field title'>
				<label htmlFor='showImagePreviews'>
					Show Image Previews when hovering a link
				</label>
				<input
					id='showImagePreviews'
					type='checkbox'
					name='showImagePreviews'
					checked={currentSettings.showImagePreviews}
					onChange={(e) => handleFieldChange('showImagePreviews', e)}
				/>
			</div>

			<div className='field title'>
				<label htmlFor='activeLineShading'>
					Background shading of active line
				</label>
				<input
					id='activeLineShading'
					type='checkbox'
					name='activeLineShading'
					checked={currentSettings.activeLineShading}
					onChange={(e) => handleFieldChange('activeLineShading', e)}
				/>
			</div>

			<div className='field title'>
				<label htmlFor='lineNumbers'>Show Line Numbers</label>
				<input
					id='lineNumbers'
					type='checkbox'
					name='lineNumbers'
					checked={currentSettings.lineNumbers}
					onChange={(e) => handleFieldChange('lineNumbers', e)}
				/>
			</div>

			<div className='field title'>
				<label htmlFor='fontSize'>
					Editor Font Size (in px)
				</label>
				<input
					id='fontSize'
					type='number'
					min={9}
					max={30}
					name='fontSize'
					value={currentSettings.fontSize}
					onChange={(e) => handleFieldChange('fontSize', e)}
				/>
			</div>
		</div>
	);
};

export default SettingsEditor;