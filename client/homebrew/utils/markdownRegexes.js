


export default {
	"v3": {
		"pageBreak": /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/gm,
        "snippetBreak": /^\\snippet\ .*$/,
		"columnBreak": /^\\column(?:break)?$/,
		"emoji": /(:\w+?:)/g,
		"superscript": /\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^/gy,
		"subscript": /\^\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^\^/gy,
		"defListSingleLine": /^(?=.*[^:])(.+?)(\s*)(::)([^\n]*)$/dmy,
		"defListMultiLine": /^::/,

		"injection": /(?:^|[^{\n])({(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\2})/gm,
		"inline_block": /{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *|}}/g,
		"block": /^ *{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *$|^ *}}$/,

	},
	"css": {
		"variable": /--[a-zA-Z0-9-_]+/gm,
	}
}