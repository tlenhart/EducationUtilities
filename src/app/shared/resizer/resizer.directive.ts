import {
  Directive,
  effect,
  EffectRef,
  ElementRef,
  HostListener,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { isMouseEvent, isTouchEvent } from '../../utils/event.utils';
import { Delta, ElementSize, PanelState, SplitDirection } from './resizer.models';

interface ResizePanelInitialState<T = MouseEvent | TouchEvent> {
  event: T,
  eventX: number;
  eventY: number;
  handle: {
    offsetTop: number;
    offsetLeft: number;
  },
  panel1: {
    initialWidth: number;
    initialHeight: number;
  },
  panel2: {
    initialWidth: number;
    initialHeight: number;
  }
}

/**
 * Directive to add resizability for two panels, either vertically or horizontally.
 *
 * Based on https://stackoverflow.com/a/55202728, but adapted to work with vertical resizing and to work as an Angular directive.
 */
@Directive({
  selector: '[euResizer]',
  standalone: true,
})
export class ResizerDirective implements OnDestroy {

  /**
   * The top/left panel when resizing.
   *
   * @remarks
   * When {@link splitDirection} is 'horizontal' this is the left panel.
   *
   * When {@link splitDirection} is 'vertical' this is the top panel.
   *
   * @type {InputSignal<HTMLElement>} The reference to the panel element.
   */
  public readonly panelOne: InputSignal<HTMLElement> = input.required();

  /**
   * The bottom/right panel when resizing.
   *
   * @remarks
   * When {@link splitDirection} is 'horizontal' this is the right panel.
   *
   * When {@link splitDirection} is 'vertical' this is the bottom panel.
   *
   * @type {InputSignal<HTMLElement>}
   */
  public readonly panelTwo: InputSignal<HTMLElement> = input.required();

  /**
   * The direction of the split.
   *
   * @remarks
   * Set to 'horizontal' for a left-right split.
   * ({@link panelOne} will be the left panel and {@link panelTwo} will be the right panel.)
   *
   * Set to 'vertical' for a top-bottom split.
   * ({@link panelOne} will be the top panel and {@link panelTwo} will be the bottom panel.)
   *
   * @defaultValue 'horizontal'
   * @type {InputSignal<SplitDirection>}
   */
  public readonly splitDirection: InputSignal<SplitDirection> = input<SplitDirection>('horizontal');

  /**
   * The minimum size of a panel, before resizing is no longer allowed in a direction.
   *
   * @defaultValue 20px.
   * @type {InputSignal<ElementSize>} Input signal containing the size.
   */
  public readonly minSize: InputSignal<ElementSize> = input<ElementSize>('20px');

  /* Model Signals */
  public readonly panelOneState: ModelSignal<PanelState> = model<PanelState>('open');
  public readonly panelTwoState: ModelSignal<PanelState> = model<PanelState>('open');
  public readonly splitLocationPercent: ModelSignal<number> = model<number>(0.50, {
    debugName: 'splitPanelPercentage',
  });

  private resizeMoveListenerDestructor?: () => void;
  private resizeCancelListenerDestructor?: () => void;

  private initialState?: ResizePanelInitialState;

  private readonly panelResizeObserver: ResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentBoxSize[0].inlineSize === 0) {
        if (entry.target === this.panelOne()) {
          this.panelOneState.set('closed');
        } else if (entry.target === this.panelTwo()) {
          this.panelTwoState.set('closed');
        }
      } else {
        if (entry.target === this.panelOne()) {
          this.panelOneState.set('open');
        } else if (entry.target === this.panelTwo()) {
          this.panelTwoState.set('open');
        }
      }
    }
  });

  private readonly initialSplitPositionEffectRef?: EffectRef;

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    // Remove the existing events, in case they already exist.
    this.removeResizeCancelEventHandlers();

    // Set the initial state that will be referenced as the panels are resized.
    this.setState(event);

    // As the mouse is moved, resize the panels and move the handle.
    this.resizeMoveListenerDestructor = this.renderer.listen('document', 'mousemove', (mouseMoveEvent: MouseEvent) => {
      this.resizePanels(mouseMoveEvent);
    });

    // When the mouse is released, clean up the event listeners.
    this.resizeCancelListenerDestructor = this.renderer.listen('document', 'mouseup', () => {
      this.removeResizeCancelEventHandlers();
    });
  }

  @HostListener('touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    // Remove the existing events, in case they already exist.
    this.removeResizeCancelEventHandlers();

    // Set the initial state that will be referenced as the panels are resized.
    this.setState(event);

    // As interaction device is moved, resize the panels and move the handle.
    this.resizeMoveListenerDestructor = this.renderer.listen('document', 'touchmove', (touchMoveEvent: TouchEvent) => {
      this.resizeTouchPanels(touchMoveEvent);
    });

    // When touch event has ended, clean up the event listeners.
    this.resizeCancelListenerDestructor = this.renderer.listen('document', 'touchend', () => {
      this.removeResizeCancelEventHandlers();
    });
  }

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly renderer: Renderer2 = inject(Renderer2);

  constructor() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'userSelect', 'none');

    // Set the default styles for the panels so they can work properly.
    effect(() => {
      this.setPanelDefaults(this.panelOne(), this.splitDirection(), this.minSize());
    });

    effect(() => {
      this.setPanelDefaults(this.panelTwo(), this.splitDirection(), this.minSize());
    });

    effect(() => {
      this.panelResizeObserver.unobserve(this.panelOne());
      this.panelResizeObserver.observe(this.panelOne());
    });

    effect(() => {
      this.panelResizeObserver.unobserve(this.panelTwo());
      this.panelResizeObserver.observe(this.panelTwo());
    });

    effect(() => {
      switch (this.splitDirection()) {
        case 'horizontal':
          this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'col-resize');
          break;
        case 'vertical':
          this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'row-resize');
          break;
      }
    });

    effect(() => {
      const panelOneState = this.panelOneState();

      switch (panelOneState) {
        case 'open':
          this.splitEvenly();
          break;
        case 'closed':
          this.closePanel(this.panelOne(), this.panelTwo());
          break;
      }
    });

    effect(() => {
      const panelTwoState = this.panelTwoState();

      switch (panelTwoState) {
        case 'open':
          this.splitEvenly();
          break;
        case 'closed':
          this.closePanel(this.panelTwo(), this.panelOne());
          break;
      }
    });

    this.initialSplitPositionEffectRef = effect(() => {
      console.log('initial resize', this.splitLocationPercent());
      if (this.splitLocationPercent() <= 1 && this.splitLocationPercent() >= 0) {
        this.splitPanels(this.splitLocationPercent());
      }

      // Only trigger the check once.
      this.initialSplitPositionEffectRef?.destroy();
    });
  }

  public ngOnDestroy(): void {
    this.panelResizeObserver.disconnect();
    this.removeResizeCancelEventHandlers();
    this.initialSplitPositionEffectRef?.destroy();
    this.panelOne().style.width = 'auto';
    this.panelTwo().style.width = 'auto';
  }

  private setState(event: MouseEvent | TouchEvent): void {
    // Set the document cursor style when "clicking" down to prevent it from changing while resizing and the cursor escapes the host element's bounds.
    document.body.style.cursor = this.splitDirection() === 'horizontal' ? 'col-resize' : 'row-resize';

    const constructedState: ResizePanelInitialState = {
      event: event,
      handle: {
        offsetTop: this.elementRef.nativeElement.offsetTop,
        offsetLeft: this.elementRef.nativeElement.offsetLeft,
      },
      panel1: {
        initialWidth: this.panelOne().offsetWidth,
        initialHeight: this.panelOne().offsetHeight,
      },
      panel2: {
        initialWidth: this.panelTwo().offsetWidth,
        initialHeight: this.panelTwo().offsetHeight,
      },
      eventX: 0,
      eventY: 0,
    };

    if (isTouchEvent(event)) {
      const touchTarget = event.targetTouches.item(0);

      constructedState.eventX = touchTarget?.clientX ?? 0;
      constructedState.eventY = touchTarget?.clientY ?? 0;
    } else if (isMouseEvent(event)) {
      constructedState.eventX = event.x;
      constructedState.eventY = event.y;
    }

    this.initialState = constructedState;
  }

  private resizePanels(mouseMoveEvent: MouseEvent): void {
    this.resize(mouseMoveEvent.x, mouseMoveEvent.y);
  }

  private resizeTouchPanels(touchMoveEvent: TouchEvent): void {
    const touchTarget = touchMoveEvent.targetTouches.item(0);

    if (!touchTarget) {
      return;
    }

    this.resize(touchTarget.clientX, touchTarget.clientY);
  }

  private resize(x: number, y: number): void {
    if (!this.initialState) {
      return;
    }

    const delta: Delta = {
      deltaX: x - this.initialState.eventX,
      deltaY: y - this.initialState.eventY,
    };

    this.resizePanelsAndMoveHandle(this.initialState, delta);
  }

  private resizePanelsAndMoveHandle(initialState: ResizePanelInitialState, delta: Delta): void {
    switch (this.splitDirection()) {
      case 'horizontal': {
        // this.renderer.setStyle(this.elementRef.nativeElement, 'left', `${initialState.handle.offsetLeft + delta.deltaX}px`);
        this.elementRef.nativeElement.style.left = `${initialState.handle.offsetLeft + delta.deltaX}px`;
        this.panelOne().style.width = `${initialState.panel1.initialWidth + delta.deltaX}px`;
        this.panelTwo().style.width = `${initialState.panel2.initialWidth - delta.deltaX}px`;

        const panelOneWidth = this.panelOne().getBoundingClientRect().width;
        const panelTwoWidth = this.panelTwo().getBoundingClientRect().width;

        this.splitLocationPercent.set(panelOneWidth / (panelOneWidth + panelTwoWidth));
        break;
      }
      case 'vertical': {
        // this.renderer.setStyle(this.elementRef.nativeElement, 'top', `${initialState.handle.offsetTop + delta.deltaY}px`);
        this.elementRef.nativeElement.style.top = `${initialState.handle.offsetTop + delta.deltaY}px`;
        this.panelOne().style.height = `${initialState.panel1.initialHeight + delta.deltaY}px`;
        this.panelTwo().style.height = `${initialState.panel2.initialHeight - delta.deltaY}px`;
        break;
      }
    }

    // this.splitLocationPercent.set(50);
  }

  private splitEvenly(): void {
    this.splitPanels(0.5);
  }

  private splitPanels(splitPercent: number): void {
    const panelOnePercent = Math.floor(splitPercent * 100);
    const panelTwoPercent = 100 - panelOnePercent;

    switch (this.splitDirection()) {
      case 'horizontal':
        this.panelOne().style.width = `${panelOnePercent}%`;
        this.panelTwo().style.width = `${panelTwoPercent}%`;
        break;
      case 'vertical':
        this.panelOne().style.height = `${panelOnePercent}%`;
        this.panelTwo().style.height = `${panelTwoPercent}%`;
        break;
    }

    this.panelOneState.set('open');
    this.panelTwoState.set('open');
  }

  private closePanel(closedPanel: HTMLElement, openedPanel: HTMLElement): void {
    switch (this.splitDirection()) {
      case 'horizontal':
        closedPanel.style.width = '0';
        openedPanel.style.width = '100%';
        break;
      case 'vertical':
        closedPanel.style.height = '0';
        openedPanel.style.height = '100%';
        break;
    }
  }

  private removeResizeCancelEventHandlers(): void {
    document.body.style.cursor = 'auto';

    if (this.resizeMoveListenerDestructor) {
      this.resizeMoveListenerDestructor();
      this.resizeMoveListenerDestructor = undefined;
    }

    if (this.resizeCancelListenerDestructor) {
      this.resizeCancelListenerDestructor();
      this.resizeCancelListenerDestructor = undefined;
    }
  }

  private setPanelDefaults(panel: HTMLElement, splitDirection: SplitDirection, minSize: ElementSize): void {
    switch (splitDirection) {
      case 'horizontal': {
        // panel.style.minWidth = minSize;
        break;
      }
      case 'vertical': {
        // panel.style.minHeight = minSize;
        break;
      }
    }
  }
}
