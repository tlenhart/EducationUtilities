// Types copied from index.d.ts from clippy.modern, and re-exported here so that I could reference the types directly.
// See: https://stackoverflow.com/a/51298325
// ! If clippy.modern is updated, new type definitions will need to be copied here.

declare module 'clippy.modern' {
  export type AgentType = 'Clippy' | 'Bonzi' | 'F1' | 'Genie' | 'Genius' | 'Links' | 'Merlin' | 'Peedy' | 'Rocky' | 'Rover';
  export type AgentSound = Record<string, string>;
  export interface AgentConfig {
    overlayCount: number;
    framesize: FrameImage;
    animations: Record<string, AgentAnimation>;
  }
  export interface Branch {
    frameIndex: number;
    weight: number;
  }
  export type FrameImage = [number, number];
  export interface Frame {
    images?: Array<FrameImage>;
    duration: number;
    branching?: {
      branches: Array<Branch>;
    };
    exitBranch?: number;
    sound?: string;
  }
  export interface AgentAnimation {
    useExitBranching?: boolean;
    frames: Array<Frame>;
  }
  export type Point = [number, number];

  export declare class Agent {
    private el;
    private animator;
    private balloon;
    private clickOffset;
    get isVisible(): boolean;
    constructor(path: string, data: AgentConfig, sounds: AgentSound);
    /**
     * Gesture at the specified coordinates
     * @param coord
     * @returns
     */
    gestureAt(coord: Point): Promise<void>;
    /**
     * Remove the agent, and remove the elements from the dom
     * @returns
     */
    destroy(): Promise<void>;
    /**
     * Move the agent to the specified coordinates
     * @param coord
     * @param duration The amount of time that the agent is traveling, excluding start and stop animations
     * @returns
     */
    moveTo(coord: Point, duration?: number): Promise<void>;
    play(name: string): Promise<void>;
    show(): Promise<void>;
    speak(text: string, hold: boolean): Promise<void>;
    hasAnimation(name: string): boolean;
    /***
     * Gets a list of animation names
     */
    animations(): Array<string>;
    /***
     * Play a random animation
     */
    animate(): Promise<void>;
    /**************************** Utils ************************************/
    /**
     * Get the direction
     * @param coord
     * @returns "Right" | "Up" | "Left" | "Down" | "Top"
     */
    private getDirection;
    /**************************** Queue and Idle handling ************************************/
    /***
     * Handle empty queue.
     * We need to transition the animation to an idle state
     * @private
     */
    onQueueEmpty(): void;
    /**
     * Is the current animation Idle?
     * @returns
     */
    private isIdleAnimation;
    /**
     * Get a random Idle animation
     */
    private getIdleAnimation;
    /**************************** Events ************************************/
    private onDoubleClick;
    private reposition;
    /**
     * Bound the coordinates to the viewport
     * @param coord
     */
    private sanitizeCoordinates;
    private dragStart;
    private drag;
  }

  export declare function load(name: AgentType, path?: string): Promise<Agent>;
}

// export { load };
