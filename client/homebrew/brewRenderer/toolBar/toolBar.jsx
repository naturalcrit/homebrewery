require('./toolBar.less');
const React = require('react');
const { useState, useRef, useEffect } = React;
const _ = require('lodash');

const ToolBar = () => {
    const [state, setState] = useState({
        currentPage: 1,
        totalPages: 10,
        zoomLevel: 100,
    });

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

    const scrollToPage = (direction) => {
        let currentPage = state.currentPage;
        if (direction === 'next') {
            currentPage += 1;
        } else {
            currentPage = currentPage - 1;
        }
        setState((prevState) => ({
            ...prevState,
            currentPage,
        }));
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

            <span className="currentZoom">{state.zoomLevel}%</span>
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
                    onClick={() => scrollToPage('previous')}
                    disabled={state.currentPage <= 1}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            <span className="currentPage">{state.currentPage}</span>
            <div className="tool">
                <button
                    className="nextPage"
                    onClick={() => scrollToPage('next')}
                    disabled={state.currentPage >= 10}
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

module.exports = ToolBar;
