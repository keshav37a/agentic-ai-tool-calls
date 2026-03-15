import { evaluate } from '@lmnr-ai/lmnr';

import { toolSelectionScore } from './evaluators.ts';
import { singleTurnExecutorWithMocks } from './executors.ts';

import dataset from './data/shell-tools.json' with { type: 'json' };

import type { EvalData } from './types.ts';

const executor = async (data: EvalData) => {
    return singleTurnExecutorWithMocks(data);
};

evaluate({
    data: dataset as any,
    executor,
    evaluators: {
        selectionScore: (output, target: any) => {
            if (target.category === 'secondary') {
                return 1;
            }
            return toolSelectionScore(output, target);
        },
    },
    groupName: 'shell-tools-selection',
});
