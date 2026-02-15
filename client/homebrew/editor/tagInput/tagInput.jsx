import "./tagInput.less";
import React, { useState, useEffect, useMemo } from "react";
import Combobox from "../../../components/combobox.jsx";

import tagSuggestionList from "./curatedTagSuggestionList.js";

const TagInput = ({ label, unique = true, values = [], placeholder = "", onChange }) => {
	const [tagList, setTagList] = useState(
		values.map((value) => ({
			value,
			display: value.trim(),
			editing: false,
		})),
	);

	// Keep in sync if parent updates values
	useEffect(() => {
		const incoming = values || [];
		const current = tagList.map((t) => t.value);

		const changed = incoming.length !== current.length || incoming.some((v, i) => v !== current[i]);

		if (changed) {
			setTagList(
				incoming.map((value) => ({
					value,
					display: value.trim(),
					editing: false,
				})),
			);
		}
	}, [values]);

	// Emit changes upward
	useEffect(() => {
		onChange?.({
			target: { value: tagList.map((t) => t.value) },
		});
	}, [tagList]);

	// Canonical duplicate groups
	const duplicateGroups = [
		["D&D", "DnD", "dnd", "Dnd", "dnD", "d&d", "d&D", "D&d"],
		["P2e", "p2e", "P2E", "Pathfinder 2e"],
	];

	const normalizeValue = (input) => {
		const group = duplicateGroups.find((grp) => grp.some((tag) => tag.toLowerCase() === input.toLowerCase()));
		return group ? group[0] : input;
	};

	const regexPattern = /^[-A-Za-z0-9&_.()]+$/;

	const submitTag = (newValue, index = null) => {
		const trimmed = newValue?.trim();
		if (!trimmed) return;
		if (!regexPattern.test(trimmed)) return;

		const canonical = normalizeValue(trimmed);

		setTagList((prev) => {
			const existsIndex = prev.findIndex((t) => t.value.toLowerCase() === canonical.toLowerCase());

			if (unique && existsIndex !== -1) return prev;

			if (index !== null) {
				return prev.map((t, i) =>
					i === index ? { ...t, value: canonical, display: canonical, editing: false } : t,
				);
			}

			return [...prev, { value: canonical, display: canonical, editing: false }];
		});
	};

	const removeTag = (index) => {
		setTagList((prev) => prev.filter((_, i) => i !== index));
	};

	const editTag = (index) => {
		setTagList((prev) => prev.map((t, i) => ({ ...t, editing: i === index })));
	};

	const suggestionOptions = tagSuggestionList.map((tag) => {

		const tagType = tag.split(':');

		let classes = 'item';
		switch (tagType[0]) {
			case 'type':
				classes = 'item type'
				break;

			case 'group':
				classes = 'item group'
				break;

			case 'meta':
				classes = 'item meta'
				break;
				
			case 'system':
				classes = 'item system'
				break;
		
			default:
				classes = 'item'
				break;
		}

		return (
			<div
				className={classes}
				key={`tag-${tag}`} // unique key
				value={tag}
				data={tag}
				title={tag}>
				{tag}
			</div>
		);
	});

	return (
		<div className="field tags">
			{label && <label>{label}</label>}

			<div className="value">
				<ul className="list">
					{tagList.map((t, i) =>
						t.editing ? (
							<input
								key={i}
								type="text"
								value={t.display}
								pattern="[-A-Za-z0-9&_.()]+"
								onChange={(e) => {
									const val = e.target.value;
									setTagList((prev) =>
										prev.map((tag, idx) => (idx === i ? { ...tag, display: val } : tag)),
									);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										submitTag(e.target.value, i);
									}
								}}
								autoFocus
							/>
						) : (
							<li key={i} className="tag" onClick={() => editTag(i)}>
								{t.display}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										removeTag(i);
									}}>
									<i className="fa fa-times fa-fw" />
								</button>
							</li>
						),
					)}
				</ul>

				<Combobox
					trigger="click"
					className="tagInput-dropdown"
					default=""
					placeholder={placeholder}
					options={suggestionOptions}
					autoSuggest={{
						suggestMethod: "startsWith",
						clearAutoSuggestOnClick: true,
						filterOn: ["value", "title"],
					}}
					onSelect={(value) => {
						submitTag(value, null);
					}}
					onEntry={(e) => {
						// Allow free typing + Enter
						if (e.key === "Enter") {
							e.preventDefault();
							submitTag(e.target.value, null);
						}
					}}
				/>
			</div>
		</div>
	);
};

export default TagInput;
