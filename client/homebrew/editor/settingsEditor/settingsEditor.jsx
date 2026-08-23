import "./metadataEditor.less";
import React, { useState } from "react";

const SettingsEditor = () => {
	const [settings, setSettings] = useState({
		blockShading: false,
		activeLineShading: true,
		showLineNumbers: true,
	});

	const handleFieldChange = (setting, e) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			[setting]: e.target.checked,
		}));
	};

	return (
		<div className="settingsEditor">
			<h1>Editor Settings</h1>

			<label>
				Background Shading of blocks in editor
				<input
					type="checkbox"
					name="blockShading"
					checked={settings.blockShading}
					onChange={(e) => handleFieldChange("blockShading", e)}
				/>
			</label>

			<label>
				Shading of active line
				<input
					type="checkbox"
					name="activeLineShading"
					checked={settings.activeLineShading}
					onChange={(e) => handleFieldChange("activeLineShading", e)}
				/>
			</label>

			<label>
				Show Line Numbers
				<input
					type="checkbox"
					name="showLineNumbers"
					checked={settings.showLineNumbers}
					onChange={(e) => handleFieldChange("showLineNumbers", e)}
				/>
			</label>
		</div>
	);
};

export default SettingsEditor;
