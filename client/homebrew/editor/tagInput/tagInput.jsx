import "./tagInput.less";
import React, { useState, useEffect } from "react";
import Combobox from "../../../components/combobox.jsx";

import tagSuggestionList from "./curatedTagSuggestionList.js";

const TagInput = ({tooltip, label, valuePatterns, values = [], unique = true, placeholder = "", smallText = "", onChange }) => {
	const [tagList, setTagList] = useState(
		values.map((value) => ({
			value,
			editing: false,
			draft: "",
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

	// substrings to be normalized to the first value on the array
	const duplicateGroups = [
		["5e 2024", "5.5e", "5e'24", "5.24", "5e24", "5.5"],
		["5e", "5th Edition"],
		["Dungeons & Dragons", "Dungeons and Dragons", "Dungeons n dragons"],
		["D&D", "DnD", "dnd", "Dnd", "dnD", "d&d", "d&D", "D&d"],
		["P2e", "p2e", "P2E", "Pathfinder 2e"],
	];

	const normalizeValue = (input) => {
		const lowerInput = input.toLowerCase();
		let normalizedTag = input;

		for (const group of duplicateGroups) {
			for (const tag of group) {
				if (!tag) continue;

				const index = lowerInput.indexOf(tag.toLowerCase());
				if (index !== -1) {
					normalizedTag = input.slice(0, index) + group[0] + input.slice(index + tag.length);
					break;
				}
			}
		}

		if (normalizedTag.includes(":")) {
			const [rawType, rawValue = ""] = normalizedTag.split(":");
			const tagType = rawType.trim().toLowerCase();
			const tagValue = rawValue.trim();

			if (tagValue.length > 0) {
				normalizedTag = `${tagType}:${tagValue[0].toUpperCase()}${tagValue.slice(1)}`;
			}
			//trims spaces around colon and capitalizes the first word after the colon
			//this is preferred to users not understanding they can't put spaces in
		}

		return normalizedTag;
	};

	const submitTag = (newValue, index = null) => {
		const trimmed = newValue?.trim();
		if (!trimmed) return;
		if (!valuePatterns.test(trimmed)) return;

		const normalizedTag = normalizeValue(trimmed);

		setTagList((prev) => {
			const existsIndex = prev.findIndex((t) => t.value.toLowerCase() === normalizedTag.toLowerCase());
			if (unique && existsIndex !== -1) return prev;
			if (index !== null) {
				return prev.map((t, i) => (i === index ? { ...t, value: normalizedTag, editing: false } : t));
			}

			return [...prev, { value: normalizedTag, editing: false }];
		});
	};

	const removeTag = (index) => {
		setTagList((prev) => prev.filter((_, i) => i !== index));
	};

	const editTag = (index) => {
		setTagList((prev) => prev.map((t, i) => (i === index ? { ...t, editing: true, draft: t.value } : t)));
	};

	const stopEditing = (index) => {
		setTagList((prev) => prev.map((t, i) => (i === index ? { ...t, editing: false, draft: "" } : t)));
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
			<div className={classes} key={`tag-${tag}`} value={tag} data={tag}>
				{tag}
			</div>
		);
	});

	return (
		<div className="tagInputWrap">
			<Combobox
				trigger="click"
				className="tagInput-dropdown"
				default=""
				placeholder={placeholder}
				options={label === "tags" ? suggestionOptions : []}
				tooltip={tooltip}
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
						e.preventDefault();
						submitTag(e.target.value);
					}
				}}
			/>
			<ul className="list">
				{tagList.map((t, i) =>
					t.editing ? (
						<input
							key={i}
							type="text"
							value={t.draft} // always use draft
							pattern={valuePatterns.source}
							onChange={(e) =>
								setTagList((prev) =>
									prev.map((tag, idx) => (idx === i ? { ...tag, draft: e.target.value } : tag)),
								)
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									submitTag(t.draft, i); // submit draft
									setTagList((prev) =>
										prev.map((tag, idx) => (idx === i ? { ...tag, draft: "" } : tag)),
									);
								}
								if (e.key === "Escape") {
									stopEditing(i);
									e.target.blur();
								}
							}}
							autoFocus
						/>
					) : (
						<li key={i} className="tag" onClick={() => editTag(i)}>
							{t.value}
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
		</div>
	);
};

export default TagInput;
