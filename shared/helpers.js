const _ = require('lodash');
const yaml = require('js-yaml');

const splitTextStyleAndMetadata = (brew) => {
    brew.text = brew.text.replaceAll('\r\n', '\n');
    if (brew.text.startsWith('```metadata')) {
        const index = brew.text.indexOf('```\n\n');
        const metadataSection = brew.text.slice(12, index - 1);
        const metadata = yaml.load(metadataSection);
        Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
        brew.text = brew.text.slice(index + 5);
    }
    if (brew.text.startsWith('```css')) {
        const index = brew.text.indexOf('```\n\n');
        brew.style = brew.text.slice(7, index - 1);
        brew.text = brew.text.slice(index + 5);
    }
};

module.exports = {
    splitTextStyleAndMetadata
};
