require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;

const ToolBar = ({ updateZoom, currentPage, onPageChange, totalPages }) => {
    const [state, setState] = useState({
        currentPage: currentPage,
        totalPages: totalPages,
        zoomLevel: 100,
        pageNumberInput: currentPage,
        zoomInput: 100,
    });

    useEffect(() => {
        updateZoom(state.zoomLevel);
    }, [state.zoomLevel]);

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            currentPage: currentPage,
            pageNumberInput: currentPage,
        }));
    }, [currentPage]);

    const setZoomLevel = (direction) => {
        let zoomLevel = state.zoomLevel;
        if (direction === 'in') {
            zoomLevel += 10;
        } else {
            zoomLevel -= 10;
        }

        setState((prevState) => ({
            ...prevState,
            zoomLevel,
        }));
    };

    const handleInputChange = (value, type) => {
        const newValue = parseInt(value, 10);

        if (type === 'zoom' && newValue >= 10 && newValue <= 300) {
            setState((prevState) => ({
                ...prevState,
                zoomInput: newValue,
            }));
        } else if (type === 'page' && newValue >= 1 && newValue <= totalPages) {
            setState((prevState) => ({
                ...prevState,
                pageNumberInput: newValue,
            }));
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
                    className='slider'
                    type="range"
                    name="zoom"
                    min={10}
                    max={300}
                    value={state.zoomInput}
                    onChange={(e) => handleInputChange(e.target.value, 'zoom')}
                    onMouseUp={(e) => {
                        const newZoomLevel = parseInt(e.target.value, 10);
                        if (newZoomLevel !== state.zoomLevel) {
                            setState((prevState) => ({
                                ...prevState,
                                zoomLevel: newZoomLevel,
                                zoomInput: newZoomLevel,
                            }));
                            updateZoom(newZoomLevel);
                        }
                    }}
                />
            </div>

            <div className="tool">
                <button
                    onClick={() => setZoomLevel('out')}
                    disabled={state.zoomLevel <= 10}
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
                value={state.pageNumberInput}
                onChange={(e) => handleInputChange(e.target.value, 'page')}
                onBlur={(e) => {
                    parseInt(state.pageNumberInput) === state.currentPage ||
                        onPageChange(parseInt(state.pageNumberInput) - 1);
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
                        console.log(
                            `page is ${state.currentPage} and i move to ${state.currentPage}`
                        );
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
