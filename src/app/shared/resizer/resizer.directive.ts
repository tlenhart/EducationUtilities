import {
  Directive,
  effect,
  ElementRef,
  HostListener,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { Delta, ElementSize, PanelState, SplitDirection } from './resizer.models';

interface ResizePanelInitialState {
  event: MouseEvent,
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

  /* Output Signals */
  public readonly panelOneState: ModelSignal<PanelState> = model<PanelState>('open');
  public readonly panelTwoState: ModelSignal<PanelState> = model<PanelState>('open');

  private mouseMoveListenerDestructor?: () => void;
  private documentMouseUpListenerDestructor?: () => void;

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

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    // Remove the existing events, in case they already exist.
    this.removeMouseMoveEventHandlers();

    // Set the initial state that will be referenced as teh panels are resized.
    this.setState(event);

    // As the mouse is moved, resize the panels and move the handle.
    this.mouseMoveListenerDestructor = this.renderer.listen('document', 'mousemove', (mouseMoveEvent: MouseEvent) => {
      this.resizePanels(mouseMoveEvent);
    });

    // When the mouse is released, clean up the event listeners.
    this.documentMouseUpListenerDestructor = this.renderer.listen('document', 'mouseup', () => {
      this.removeMouseMoveEventHandlers();
    });
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {
    this.elementRef.nativeElement.style.userSelect = 'none';
    // this.elementRef.nativeElement.style.backgroundColor = 'var(--synth-light-blue)';

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
          this.elementRef.nativeElement.style.cursor = 'col-resize';
          break;
        case 'vertical':
          this.elementRef.nativeElement.style.cursor = 'row-resize';
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
    }, { allowSignalWrites: true });

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
    }, { allowSignalWrites: true });
  }

  public ngOnDestroy(): void {
    this.panelResizeObserver.disconnect();
    this.removeMouseMoveEventHandlers();
  }

  private setState(event: MouseEvent): void {
    this.initialState = {
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
    };
  }

  private resizePanels(mouseMoveEvent: MouseEvent): void {
    if (!this.initialState) {
      return;
    }

    const delta: Delta = {
      deltaX: mouseMoveEvent.x - this.initialState.event.x,
      deltaY: mouseMoveEvent.y - this.initialState.event.y,
    };
    this.resizePanelsAndMoveHandle(this.initialState, delta);
  }

  private resizePanelsAndMoveHandle(initialState: ResizePanelInitialState, delta: Delta): void {
    switch (this.splitDirection()) {
      case 'horizontal':
        this.elementRef.nativeElement.style.left = `${initialState.handle.offsetLeft + delta.deltaX}px`;
        this.panelOne().style.width = `${initialState.panel1.initialWidth + delta.deltaX}px`;
        this.panelTwo().style.width = `${initialState.panel2.initialWidth - delta.deltaX}px`;
        break;
      case 'vertical':
        this.elementRef.nativeElement.style.top = `${initialState.handle.offsetTop + delta.deltaY}px`;
        this.panelOne().style.height = `${initialState.panel1.initialHeight + delta.deltaY}px`;
        this.panelTwo().style.height = `${initialState.panel2.initialHeight - delta.deltaY}px`;
        break;
    }
  }

  private splitEvenly(): void {
    switch (this.splitDirection()) {
      case 'horizontal':
        this.panelOne().style.width = '50%';
        this.panelTwo().style.width = '50%';
        break;
      case 'vertical':
        this.panelOne().style.height = '50%';
        this.panelTwo().style.height = '50%';
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

  private removeMouseMoveEventHandlers(): void {
    if (this.mouseMoveListenerDestructor) {
      this.mouseMoveListenerDestructor();
      this.mouseMoveListenerDestructor = undefined;
    }

    if (this.documentMouseUpListenerDestructor) {
      this.documentMouseUpListenerDestructor();
      this.documentMouseUpListenerDestructor = undefined;
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
