const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
require('./tutorial.less');

const DISMISS_KEY = 'dismiss_tutorial';

const TutorialPopup = createClass({
    displayName: 'TutorialPopup',

    getInitialState: function () {
        return {
            steps: {},
            currentStep: 'splitPaneStep', // Initialize to the first step
        };
    },

    componentDidMount: function () {
        this.checkTutorial();
        window.addEventListener('resize', this.checkTutorial);
    },

    componentWillUnmount: function () {
        window.removeEventListener('resize', this.checkTutorial);
    },

    steps: {
        splitPaneStep: function () {
            window.localStorage.setItem(
                'naturalcrit-pane-split',
                window.innerWidth / 2
            );
            return (
                <div className="content">
                    <div className="editor">
                        <span className="explanation editor">
                            This is the Editor pane, where you edit your
                            document using Markdown
                        </span>
                    </div>
                    <div className="brew">
                        <span className="explanation brew">
                            This is the Brew pane, it displays a preview of the
                            document
                        </span>
                    </div>
                </div>
            );
        },
        snippetsStep: function () {
            return (
                <div className="content">
                    <i className="fas fa-arrow-left"></i>
                    <span className="explanation">
                        This is the Snippet Bar, here you will find pieces of
                        code to help you write your document.
                    </span>
                    <span>
                        Be sure to check on this every now and again, new
                        snippets come every once in a while.
                    </span>
                </div>
            );
        },
        tabsStep: function () {
            return (
                <div className="content">
                    <span className="explanation">
                        There are 3 editors: Brew, Style, and Properties.
                    </span>
                    <span className="explanation">
                        Use each editor tab to edit your brew text (Markdown/HTML), styles (CSS), and properties.
                    </span>
                </div>
            );
        },
        navigationStep: function () {
            return (
                <div className="content">
                    <i className="fas fa-arrow-right"></i>
                    <span className="explanation">
                        This is the navigation bar, here you will find different
                        options to help you navigate and find what you are
                        looking for.
                    </span>
                </div>
            );
        },
    },

    checkTutorial: function () {
        const hideDismiss = localStorage.getItem(DISMISS_KEY);
        if (hideDismiss) return this.setState({ steps: {} });

        this.setState({
            steps: _.mapValues(this.steps, (fn) => fn()),
        });
    },

    dismiss: function () {
        localStorage.setItem(DISMISS_KEY, true);
        this.checkTutorial();
    },

    getNextStep: function () {
        const steps = Object.keys(this.steps);
        const currentStepIndex = steps.indexOf(this.state.currentStep);
        const nextStepIndex = currentStepIndex + 1;

        if (nextStepIndex < steps.length) {
            const nextStep = steps[nextStepIndex];
            this.setState({ currentStep: nextStep });
        } else {
            // If we've reached the end of the steps, dismiss the tutorial
            this.dismiss();
        }
    },

    renderControls: function () {
        const steps = Object.keys(this.steps);
        const currentStepIndex = steps.indexOf(this.state.currentStep);
        const nextStepIndex = currentStepIndex + 1;

        if (nextStepIndex < steps.length) {
            return (
                <div className="buttons">
                    <button className="dismiss" onClick={this.dismiss}>
                        Skip
                    </button>
                    <button className="next" onClick={this.getNextStep}>
                        Next
                    </button>
                </div>
            );
        } else {
            return (
                <div className="buttons">
                    <button className="dismiss" onClick={this.dismiss}>
                        Finish
                    </button>
                </div>
            );
        }
    },

    render: function () {
        const { currentStep, steps } = this.state;

        if (_.isEmpty(steps)) return null;

        return (
            <div className={`tutorial ${currentStep}`}>
                {steps[currentStep]}
                {this.renderControls()}
            </div>
        );
    },
});

module.exports = TutorialPopup;
