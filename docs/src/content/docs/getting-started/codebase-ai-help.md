---
title: "Codebase AI Help"
sidebar:
  order: 9998
---

This is the minimum setup for using an AI coding assistant to ask questions about the Old School Bot and BSO codebases.

## Setup

1. Make a [GitHub](https://github.com/) account.
2. Install [Visual Studio Code](https://code.visualstudio.com/).
3. Install [Git](https://git-scm.com/) or [GitHub Desktop](https://desktop.github.com/).
4. Fork the [oldschoolbot repo](https://github.com/oldschoolgg/oldschoolbot) on GitHub. A fork is your own copy of the repo on your GitHub account. On the repo page, click **Fork**, keep the default options, and create the fork. You should then have a copy at `https://github.com/YOUR_USERNAME/oldschoolbot`.
5. Clone your fork to your computer. The easiest way is GitHub Desktop: click **File** -> **Clone repository**, choose your `oldschoolbot` fork, then clone it.
6. Open the cloned `oldschoolbot` folder in VS Code. In GitHub Desktop, use **Repository** -> **Open in Visual Studio Code**. In VS Code, use **File** -> **Open Folder** and select the `oldschoolbot` folder.
7. Install your preferred AI coding tool. For example:
	- ChatGPT Codex: install or open Codex, then use it in the `oldschoolbot` folder.
	- Claude Code: install Claude Code, then open it in the `oldschoolbot` folder.
	- VS Code AI extensions: open the Extensions tab in VS Code, search for the tool you want, install it, then let it use the open folder as context.

Once the repo is open in VS Code, ask the AI agent questions about the codebase. For best results, tell it whether you are asking about OSB (`master`) or BSO (`bso`).

## Branches

- `master` is the main Old School Bot branch.
- `bso` is the main BSO branch.

Before asking questions, make sure you are on the right branch and have the latest public code.

Using Git from the terminal:

```sh
git remote add upstream https://github.com/oldschoolgg/oldschoolbot.git
git fetch upstream

git checkout master
git pull upstream master

git checkout bso
git pull upstream bso
```

If `upstream` already exists, `git remote add upstream ...` will fail. That is fine; just continue with `git fetch upstream`.

Protected branches do not stop you pulling public code. They only stop people without permission from pushing directly to `master`/`bso` on the main repo.

If you get stuck with branch switching, this is a more direct way to reset your local branches to the latest public code:

```sh
git fetch upstream
git checkout -B master upstream/master
git checkout -B bso upstream/bso
```

In GitHub Desktop, use **Current Branch** to switch between `master` and `bso`, then use **Fetch origin** / **Pull origin**. If your fork is behind the main repo, sync it on GitHub first.

## Making Wiki Edits

You can also use this setup to make wiki edits. All wiki changes should start from the latest `master` branch, even if the page is about BSO.

Using Git from the terminal:

```sh
git checkout master
git pull upstream master
git checkout -b branch-name
```

Then edit the relevant files in `docs/src/content/docs`. When you are done:

```sh
git add docs/src/content/docs
git commit -m "Update wiki"
git push origin branch-name
```

On GitHub, open your fork and click **Compare & pull request**. The pull request should be from your new branch into `oldschoolgg/oldschoolbot`'s `master` branch.

In GitHub Desktop, switch to `master`, pull the latest changes, click **Current Branch** -> **New Branch**, make your wiki edits, commit them, then click **Publish branch**. GitHub should then offer a button to open a pull request.

See the [Wiki](/getting-started/wiki) page for more information.

## Asking AI

Useful examples:

- "I'm on the `bso` branch. What is the drop rate for X?"
- "I'm on the `master` branch. What items boost Y?"
- "Explain how this activity works, but do not edit files."
- "Find where this item/monster/activity is defined."

Example of a useful codebase question:

[[codebase-ai-example.webp]]

Be clear when you only want an explanation. AI agents can edit files if you allow them to.

AI tools have usage limits. Asking lots of broad questions, asking the same thing repeatedly, or asking the AI to read a large amount of code can use up your allowance faster. Depending on the tool and plan you use, this may cause temporary rate limits, make you wait, or cost more money. Start with specific questions and check your tool's usage/pricing page if unsure.

## Accuracy

The code you have locally is only as current as the branch you pulled. Always pull the latest public `master` or `bso` code before asking questions.

The live bot can still be slightly different from public GitHub. This can happen if Cyr has made private BSO updates that are not public yet, or if code has been merged but is not live on the bot yet. Treat AI answers as guidance based on the code it can see, not as a guarantee of the live bot's exact behaviour.
