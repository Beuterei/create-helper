import type { RequiredProperty } from './until';
import type { DistinctQuestion } from 'inquirer';

// Make name required because we use it as identifier
export type DistinctQuestionModified = RequiredProperty<DistinctQuestion, 'name'>;
