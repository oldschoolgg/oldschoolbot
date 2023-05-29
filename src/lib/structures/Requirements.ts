import { Bank } from 'oldschooljs';

import { Skills } from '../types';

type RequirementResult =
	| {
			doesHave: true;
			reason: null;
	  }
	| {
			doesHave: false;
			reason: string;
	  };

type ManualHasFunction = (user: MUser) => RequirementResult;

type Requirement =
	| ({
			name?: string;
	  } & { has: ManualHasFunction })
	| { skillRequirements: Partial<Skills> }
	| { clRequirement: Bank };

export class Requirements {
	requirements: Requirement[] = [];

	add(requirement: Requirement) {
		this.requirements.push(requirement);
		return this;
	}
}
