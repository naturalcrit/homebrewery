import "./tagInput.less";
import React, { useState, useEffect, useMemo } from "react";
import Combobox from "../../../components/combobox.jsx";

import tagSuggestionList from "./curatedTagSuggestionList.js";

const TagInput = ({ label, valuePatterns, values = [], unique = true, placeholder = "", smallText = "", onChange }) => {
	const [tagList, setTagList] = useState(
		values.map((value) => ({
			value,
			display: value.trim(),
			editing: false,
		})),
	);

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

	useEffect(() => {
		onChange?.({
			target: { value: tagList.map((t) => t.value) },
		});
	}, [tagList]);

	const duplicateGroups = [
		["5e 2024", "5.5e", "5e'24", "5.24", "5e24", "5.5"],
		["5e", "5th Edition"],
		["Dungeons & Dragons", "Dungeons and Dragons", "Dungeons n dragons"],
		["D&D", "DnD", "dnd", "Dnd", "dnD", "d&d", "d&D", "D&d"],
		["P2e", "p2e", "P2E", "Pathfinder 2e"],
		["meta:", "Meta:", "META:"],
		["group:", "Group:", "GROUP:"],
		["type:", "Type:", "TYPE:"],
		["system:", "System:", "SYSTEM:"],
	];

	const normalizeValue = (input) => {
		const lowerInput = input.toLowerCase();

		for (const group of duplicateGroups) {
			for (const tag of group) {
				if (!tag) continue;

				const index = lowerInput.indexOf(tag.toLowerCase());
				if (index !== -1) {
					return input.slice(0, index) + group[0] + input.slice(index + tag.length);
				}
			}
		}

		return input;
	};

	const submitTag = (newValue, index = null) => {
		const trimmed = newValue?.trim();
		console.log(newValue, trimmed);
		if (!trimmed) return;
		console.log(valuePatterns.test(trimmed));
		if (!valuePatterns.test(trimmed)) return;

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
		const tagType = tag.split(":");

		let classes = "item";
		switch (tagType[0]) {
			case "type":
				classes = "item type";
				break;

			case "group":
				classes = "item group";
				break;

			case "meta":
				classes = "item meta";
				break;

			case "system":
				classes = "item system";
				break;

			default:
				classes = "item";
				break;
		}

		return (
			<div className={classes} key={`tag-${tag}`} value={tag} data={tag} title={tag}>
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
								pattern={valuePatterns.source}
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
					options={label === "tags" ? suggestionOptions : []}
					autoSuggest={
						label === "tags"
							? {
									suggestMethod: "startsWith",
									clearAutoSuggestOnClick: true,
									filterOn: ["value", "title"],
								}
							: { suggestMethod: "includes", clearAutoSuggestOnClick: true, filterOn: [] }
					}
					valuePatterns={valuePatterns.source}
					onSelect={(value) => submitTag(value)}
					onEntry={(e) => {
						if (e.key === "Enter") {
							console.log("submit");
							e.preventDefault();
							submitTag(e.target.value);
						}
					}}
				/>
				{smallText.length !== 0 && <small>{smallText}</small>}
			</div>
		</div>
	);
};

export default TagInput;
