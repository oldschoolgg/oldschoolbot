#!/usr/bin/env node
import { render } from 'ink';
// import meow from 'meow';
import { Root } from './app.js';

// const cli = meow(
// 	`
// 	Usage
// 	  $ my-ink-cli

// 	Options
// 		--name  Your name

// 	Examples
// 	  $ my-ink-cli --name=Jane
// 	  Hello, Jane
// `,
// 	{
// 		importMeta: import.meta,
// 		flags: {
// 			name: {
// 				type: 'string',
// 			},
// 		},
// 	},
// );

render(<Root />);
