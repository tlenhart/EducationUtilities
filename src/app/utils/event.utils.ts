export function isMouseEvent(event: MouseEvent | TouchEvent): event is MouseEvent {
  return event instanceof MouseEvent;
}

export function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event instanceof TouchEvent;
}
