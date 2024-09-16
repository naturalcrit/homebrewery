import React from 'react';
import './sourcePage.less';
const UIPage = require('../basePages/uiPage/uiPage.jsx');

const SourcePage = (props) => {
    const { brew } = props;

    const sanitizeFilename = (filename) => {
        return filename.replace(/[\/\\?%*:|"<>]/g, '_');
    };

    const prefix = 'HB - ';
    let fileName = sanitizeFilename(`${prefix}${brew.title}`).replace(/ /g, '');
    if (!fileName || fileName.length === 0) {
        fileName = `${prefix}-Untitled-Brew`;
    }

    // Function to encode text for HTML display
    const encodeText = () => {
        const replaceStrings = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
        let text = brew.text || '';
        for (const replaceStr in replaceStrings) {
            text = text.replace(
                new RegExp(replaceStr, 'g'),
                replaceStrings[replaceStr]
            );
        }
        return text;
    };

    // Function to handle downloading the text
    const downloadText = () => {
        const encodedText = encodeText();
        const blob = new Blob([encodedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.txt`; // Set the filename for download
        a.click(); // Trigger the download
        URL.revokeObjectURL(url); // Clean up the URL object
    };

    const renderSourcePage = () => (
        <div className="source">
            <div className="buttons">
                <button
                    className="copy"
                    onClick={() => {
                        navigator.clipboard.writeText(encodeText());
                    }}
                >
                    Copy <i className="fas fa-copy" />
                </button>
                <button className="download" onClick={downloadText}>
                    Download <i className="fas fa-download" />
                </button>
            </div>

            <code className="code">
                <pre style={{ whiteSpace: 'pre' }}>{encodeText()}</pre>
            </code>
        </div>
    );

    // Render the page
    return <UIPage brew={brew}>{renderSourcePage()}</UIPage>;
};

module.exports = SourcePage;
