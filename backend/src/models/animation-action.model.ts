export enum ActionType {
  SHOW = 'SHOW',
  HIDE = 'HIDE',
  MOVE = 'MOVE',
  ANIMATE = 'ANIMATE',
  WAIT = 'WAIT',
  SPEAK = 'SPEAK',
  PLAY_SOUND = 'PLAY_SOUND',
  ROTATE = 'ROTATE',
  SCALE = 'SCALE',
}

export interface AnimationAction {
  type: ActionType;
  target?: string; // The ID or name of the character/object
  params: Record<string, any>;
  startTime?: number; // Relative to the start of the scene in seconds
  duration?: number; // In seconds
}
