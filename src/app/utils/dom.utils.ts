import { getIncrementor } from './number-utils';

export const getSequentialId: Generator<string, never, string> = getIncrementor();
