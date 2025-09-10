export default {
	meta: {
		type: "layout",
		docs: {
			description: "Enforce alignment of adjacent useState variable pairs",
		},
		fixable: "whitespace",
		schema: [],
	},
	create(context) {
		const sourceCode = context.getSourceCode();
		const useStateDeclarations = [];

		return {
			VariableDeclaration(node) {
				for (const decl of node.declarations) {
					const init = decl.init;
					if (
						init &&
						init.type === "CallExpression" &&
						init.callee.name === "useState" &&
						decl.id.type === "ArrayPattern"
					) {
						useStateDeclarations.push(decl);
					}
				}
			},
			"Program:exit"() {
				if (useStateDeclarations.length < 2) return;

				// Sort by line number
				useStateDeclarations.sort(
					(a, b) => a.loc.start.line - b.loc.start.line
				);

				// Group adjacent lines
				const groups = [];
				let currentGroup = [useStateDeclarations[0]];

				for (let i = 1; i < useStateDeclarations.length; i++) {
					const prev = useStateDeclarations[i - 1];
					const curr = useStateDeclarations[i];

					if (curr.loc.start.line === prev.loc.end.line + 1) {
						currentGroup.push(curr);
					} else {
						if (currentGroup.length > 1) groups.push(currentGroup);
						currentGroup = [curr];
					}
				}
				if (currentGroup.length > 1) groups.push(currentGroup);

				// Analyze each group
				for (const group of groups) {
					const positions = group.map((decl) => {
						const text = sourceCode.getText(decl);
						const commaIndex = text.indexOf(",");
						const closingBracketIndex = text.lastIndexOf("]");
						return {
							node: decl,
							comma: commaIndex,
							closing: closingBracketIndex,
						};
					});

					const maxComma = Math.max(...positions.map((p) => p.comma));
					const maxClosing = Math.max(
						...positions.map((p) => p.closing)
					);

					for (const pos of positions) {
						if (
							pos.comma !== maxComma ||
							pos.closing !== maxClosing
						) {
							context.report({
								node: pos.node,
								message: "useState pair is not aligned with others in its block.",
								fix(fixer) {
									const text = sourceCode.getText(pos.node);
									const parts = text.match(/^\[\s*(.+?)\s*,\s*(.+?)\s*\]\s*=\s*useState\((.+)\)$/);
									if (!parts) return null;

									const [_, left, right, value] = parts;

									const paddedLeft = left.padEnd(maxComma - 1);
									const paddedRight = right.padEnd(maxClosing - maxComma - 2);
									const aligned = `[${paddedLeft}, ${paddedRight}] = useState(${value})`;
									console.log("Pre:  " + text);
									console.log("Post: " + aligned);
									return [
										fixer.replaceText(pos.node, aligned),
										fixer.insertTextBefore(pos.node.parent, ""),
										fixer.insertTextAfter(pos.node.parent, "")
									];
								}
							});
						}
					}
				}
			},
		};
	},
};