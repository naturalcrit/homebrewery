const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const DISMISS_KEY = 'dismiss_tutorial';

const TutorialPopup = createClass({
    displayName: 'TutorialPopup',

    getInitialState: function () {
        return {
            steps: {},
            currentStep: 'splitPane', // Initialize to the first step
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
        splitPane: function () {
            return (
                <div>
                    <div className="editor">
                        <span className="paneName">
                            This is the Editor pane, where you edit your
                            document using Markdown
                        </span>
                    </div>
                    <div className="brew">
                        <span className="paneName">
                            This is the Brew pane, it displays a preview of the
                            document
                        </span>
                    </div>
                </div>
            );
        },
        snippets: function () {
            return (
                <div>
                    <span className="explanation">
                        This is the Snippet Bar, here you will find pieces of
                        code to help you write
                    </span>
                    <span>
                        Be sure to check on this every now and again, new
                        snippets come every once in a while
                    </span>
                </div>
            );
        },
        beta: function () {
            return (
                <div>
                    <span className="explanation">
                        This beta tag marks features that are quite new and
                        susceptible to changes in the near future.
                    </span>
                </div>
            );
        },
        navigation: function () {
            return (
                <div>
                    <span className="explanation">
                        This is the navigation bar, here you will find different
                        options to help you navigate and find what you are
                        looking for
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
                <div>
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
                <button className="dismiss" onClick={this.dismiss}>
                    Finish
                </button>
            );
        }
    },

    render: function () {
        const { currentStep, steps } = this.state;

        if (_.isEmpty(steps)) return null;

        return (
            <div className={`tutorial ${currentStep}`}>
                {steps[currentStep]}
                {this.renderControls()};
            </div>
        );
    },
});

module.exports = TutorialPopup;
