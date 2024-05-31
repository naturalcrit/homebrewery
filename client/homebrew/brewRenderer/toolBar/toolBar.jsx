require('./toolBar.less');
const React = require('react');
const { useState, useRef, useEffect } = React;
const _ = require('lodash');

const ToolBar = ({ updateZoom, currentPage, onPageChange, totalPages }) => {
    const [state, setState] = useState({
        currentPage: currentPage,
        totalPages: totalPages,
        zoomLevel: 100,
    });

    const [pageNumberInput, setPageNumberInput] = useState(
        state.currentPage
    );
    const [zoomInput, setZoomInput] = useState(state.zoomLevel);

    useEffect(() => {
        console.log(`Zoom to: ${state.zoomLevel}`);
        updateZoom(state.zoomLevel);
        setZoomInput(state.zoomLevel);
    }, [state.zoomLevel]);

    // Update currentPage whenever page prop changes
    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            currentPage: currentPage,
        }));
        setPageNumberInput(currentPage);
    }, [currentPage]);

    const setZoomLevel = (direction) => {
        let zoomLevel = state.zoomLevel;
        if (direction === 'in') {
            zoomLevel += 10;
        } else {
            zoomLevel = zoomLevel - 10;
        }

        setState((prevState) => ({
            ...prevState,
            zoomLevel,
        }));
    };

    const handleInputChange = (value, type) => {
        // Remove the "%" symbol from the input value
        const newValue = parseInt(value.replace('%', ''), 10);

        // Check the type of input (zoom or page)
        if (type === 'zoom') {
            // Check if zoom level is within the allowed range
            if (newValue >= 10 && newValue <= 300) {
                setZoomInput(newValue + '%'); // Add "%" back to the value
            }
        } else if (type === 'page') {
            // Check if page number is within the allowed range
            if (newValue >= 1 && newValue <= totalPages) {
                setPageNumberInput(newValue);
            }
        }
    };

    return (
        <div className="toolBar">
            <div className="tool">
                <button
                    onClick={() => setZoomLevel('in')}
                    disabled={state.zoomLevel >= 300}
                >
                    Zoom In
                </button>
            </div>

            <div className="tool">
                <input
                    type="number"
                    name="zoom"
                    min={10}
                    max={300}
                    value={zoomInput}
                    onChange={(e) => handleInputChange(e.target.value, 'zoom')}
                    onBlur={(e) => {
                        const newZoomLevel = parseInt(
                            e.target.value.replace('%', ''),
                            10
                        );
                        if (newZoomLevel !== state.zoomLevel) {
                            updateZoom(newZoomLevel);
                        }
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                />
                <span>%</span>
            </div>

            <div className="tool">
                <button
                    onClick={() => setZoomLevel('out')}
                    disabled={state.zoomLevel <= 20}
                >
                    Zoom Out
                </button>
            </div>

            <div className="tool">
                <button
                    className="previousPage"
                    onClick={() => {
                        console.log(`page is ${state.currentPage}`);
                        onPageChange(state.currentPage - 2);
                    }}
                    disabled={state.currentPage <= 1}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            <input
                type="number"
                name="page"
                min={1}
                max={state.totalPages}
                id="pageInput"
                value={pageNumberInput}
                onChange={(e) => handleInputChange(e.target.value, 'page')}
                onBlur={(e) => {
                    parseInt(pageNumberInput) === state.currentPage ||
                        onPageChange(parseInt(pageNumberInput) - 1);
                }}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.target.blur();
                    }
                }}
            />

            <div className="tool">
                <button
                    className="nextPage"
                    onClick={() => {
                        console.log(`page is ${state.currentPage} and i move to ${state.currentPage}`);
                        onPageChange(state.currentPage);
                    }}
                    disabled={state.currentPage >= state.totalPages}
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

module.exports = ToolBar;
