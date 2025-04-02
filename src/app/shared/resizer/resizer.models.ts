export type SizeUnits = 'px' | 'em' | 'rem' | 'vh' | 'vw';

export type ElementSize = `${number}${SizeUnits}`;

export type SplitDirection = 'horizontal' | 'vertical';

export type PanelState = 'open' | 'closed';

export interface Delta {
  deltaX: number;
  deltaY: number;
}

