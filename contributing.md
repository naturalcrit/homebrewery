# Contributing to Homebrewery

## How can I contribute?

### Improve documentation

As a user of Homebrewery you're the perfect candidate to help us improve our documentation. Typo corrections, error fixes, better explanations, more examples, etc. Open issues for things that could be improved. Anything. Even improvements to this document.


### Improve issues

Some issues are created with missing information, not reproducible, or plain invalid. Help make them easier to resolve. Handling issues takes a lot of time that we could rather spend on fixing bugs and adding features.


### Write code

You can use issue labels to discover issues you could help out with:

* [`blocked` issues](https://github.com/naturalcrit/homebrewery/labels/blocked) need help getting unstuck
* [`bug` issues](https://github.com/naturalcrit/homebrewery/labels/bug) are known bugs we'd like to fix
* [`feature` issues](https://github.com/naturalcrit/homebrewery/labels/feature) are features we're open to including
* [`help wanted`](https://github.com/naturalcrit/homebrewery/labels/help%20wanted) labels are especially useful.

If you're updating dependencies, please make sure you use npm@5.6.0 and commit the updated `package-lock.json` file.

You can also refer to the [Development Roadmap on Trello](https://trello.com/b/q6kE29F8/development-roadmap)


## Submitting an issue

- The issue tracker is for issues. Use the [subreddit](https://www.reddit.com/r/homebrewery/) for support.
- Search the issue tracker before opening an issue.
- Use a clear and descriptive title.
- Include as much information as possible: Steps to reproduce the issue, error message, browser type and version, etc.


## Submitting a pull request

- Non-trivial changes are often best discussed in an issue first, to prevent you from doing unnecessary work.
- For ambitious tasks, you should try to get your work in front of the community for feedback as soon as possible. Open a pull request as soon as you have done the minimum needed to demonstrate your idea. At this early stage, don't worry about making things perfect, or 100% complete. Add a [WIP] prefix to the title, and describe what you still need to do. This lets reviewers know not to nit-pick small details or point out improvements you already know you need to make.
- New features should be accompanied with tests and documentation if applicable.
- Lint and test before submitting the pull request by running `$ npm run verify`.
- If your code is not passing Linting checks due to a non-fixable warning, and you feel it's valid (eg. we lint on a file being too long, but sometimes a file just _has_ to be long), add `/* eslint-disable [rule-name] */` to the top of the file. Be sure to justfiy your lint override in your PR description.
- Use a clear and descriptive title for the pull request and commits.
- You might be asked to do changes to your pull request. There's never a need to open another pull request. [Just update the existing one.](https://github.com/RichardLitt/knowledge/blob/master/github/amending-a-commit-guide.md)
