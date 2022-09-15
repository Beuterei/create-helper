import type { DistinctQuestion } from 'inquirer';
import type { RequiredProperty } from './until';

// Make name required because we use it as identifier
export type DistinctQuestionModified = RequiredProperty<DistinctQuestion, 'name'>;
