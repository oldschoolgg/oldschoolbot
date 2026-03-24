import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { docsSchema } from '@astrojs/starlight/schema';

const choiceNodeSchema = z.object({
	name: z.string(),
	value: z.union([z.string(), z.number()])
});

const optionNodeSchema = z.object({
	name: z.string(),
	description: z.string(),
	type: z.string(),
	required: z.boolean(),
	choices: z.array(choiceNodeSchema).optional(),
	min: z.number().optional(),
	max: z.number().optional()
});

type CommandNode = {
	name: string;
	path: string;
	description: string;
	category?: string;
	examples?: string[];
	options: z.infer<typeof optionNodeSchema>[];
	subcommands: CommandNode[];
};

const commandNodeSchema: z.ZodType<CommandNode> = z.lazy(() =>
	z.object({
		name: z.string(),
		path: z.string(),
		description: z.string(),
		category: z.string().optional(),
		examples: z.array(z.string()).optional(),
		options: z.array(optionNodeSchema),
		subcommands: z.array(commandNodeSchema)
	})
);

export const collections = {
	docs: defineCollection({ schema: docsSchema() }),
	generated: defineCollection({
		type: 'data',
		schema: z.object({
			generatedAt: z.string(),
			version: z.string().optional(),
			commands: z.array(commandNodeSchema)
		})
	})
};
