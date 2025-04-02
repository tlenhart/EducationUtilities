import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { Agent, load as loadAgent } from 'clippy.modern';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../core/settings/settings.service';
import { ClippySettings } from '../../models';
import { sleep } from '../../utils/promise.utils';
import { isGlobalSettingEnabled, isSettingEnabledAndTrue } from '../../utils/setting.utils';

@Component({
  selector: 'app-clippy',
  imports: [
    MatButton,
  ],
  template: `
    <ng-template #rightClickMenu>
      <div class="menu-container">
        <!--<button mat-flat-button (click)="closeClippy()">Close</button>-->
        <button mat-flat-button (click)="closeClippy()">Close</button>
      </div>
    </ng-template>
  `,
  styles: `
    @use '@angular/material' as mat;

    //:host {
    .menu-container {
      padding: 0.25rem 0;

      @include mat.button-overrides((
        filled-container-shape: square,
        filled-container-height: 2rem,
      ));
    }

    button {
      width: 7rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClippyComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  public readonly removeClippy: OutputEmitterRef<void> = output<void>();

  private readonly settingsService: SettingsService = inject(SettingsService);
  private readonly overlay: Overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly subscriptions: Subscription = new Subscription();
  private agent?: Agent;
  private agentAnimations: ReadonlyArray<string> = [];
  private animationTimeout: number | undefined = undefined;
  private canDeleteTimeout: number | undefined = undefined;

  private clippyRef: HTMLDivElement | null = null;
  private clippySpeechBubbleRef: HTMLDivElement | null = null;
  private clippyAbortController: AbortController | null = null;
  private overlayRef: OverlayRef | null = null;
  private templatePortal: TemplatePortal | null = null;

  private readonly informativeMessages: ReadonlyArray<string> = [
    `Did you know that you can get rid of me in the settings?\n I'll be really sad, but it can be done.`,
    `You can right-click on me for additional option(s).`,
    `Tooltips when hovering over grid show/hide checkboxes can be disabled in the settings if they are annoying.`,
  ];

  private readonly rightClickMenu = viewChild.required<TemplateRef<unknown>>('rightClickMenu');

  constructor() {
    this.subscriptions.add(toObservable(this.settingsService.settings).subscribe({
      next: (settings) => {
        void (async () => {
          await this.loadAgent(settings.clippy);
        })();
      },
    }));
  }

  public ngOnInit(): void {
    this.templatePortal = new TemplatePortal(this.rightClickMenu(), this.viewContainerRef);
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'no-outlet-backdrop',
    });

    this.subscriptions.add(this.overlayRef.backdropClick().subscribe(() => {
      console.log('backdrop clicked');
      this.overlayRef?.detach();
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  public async ngOnDestroy(): Promise<void> {
    this.subscriptions.unsubscribe();

    if (this.templatePortal?.isAttached) {
      this.templatePortal.detach();
    }

    this.overlayRef?.dispose();
    await this.destroyAgent();
  }

  public closeClippy(): void {
    this.removeClippy.emit();
  }

  private randomize(): void {
    if (this.animationTimeout) {
      return;
    }

    let timeout = Math.random() * 22_000;

    // Set a minimum timeout of 10s.
    if (timeout / 1000 < 10) {
      timeout = 10_000;
    }

    this.animationTimeout = self.setTimeout(() => {
      void (async () => {
        // Pick a random animation so we can see what it is.
        const animation: string = this.agentAnimations[Math.floor(Math.random() * this.agentAnimations.length)];

        await this.agent?.speak(`Playing the ${animation} animation.`, true);

        // Play the animation.
        // You can also use `await this.agent?.animate();` if you want the library to handle the random animation.
        try {
          // Some animations can get stuck, like 'Writing' for clippy, so we put a limit of 10 seconds on how long a randomized animation can play.
          // The animation itself may continue playing, but it allows another animation to go through.
          await Promise.race([
            this.agent?.play(animation),

            // Resolve a promise after 10s to prevent one animation from blocking the use of other animations.
            sleep(10_000),
            // If needed in the future, before resolving, clear the animation queue (if possible).
          ]);
        } catch (error: unknown) {
          console.warn(error);
        }

        // Clear the timeout value so it can be set again.
        this.clearAnimationTimeout();

        // Set the timeout for the next randomization instance.
        this.randomize();
      })();
    }, timeout);
  }

  /**
   * Load a Clippy and Friends agent.
   * @param {ClippySettings} settings - Clippy and Friends settings.
   * @returns {Promise<void>} - Awaitable.
   * @private
   */
  private async loadAgent(settings: ClippySettings): Promise<void> {
    // Destroy any existing agent so that updated settings can be applied.
    await this.destroyAgent();

    if (!isGlobalSettingEnabled(settings)) {
      // If all Clippy related settings are disabled, return and don't load the clippy agent.
      return;
    }

    const agentDirectory: string = isSettingEnabledAndTrue(settings.playSounds) ? 'agents' : 'agents-no-sound';

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.agent = await loadAgent(settings.selectedAgent.value || settings.selectedAgent.defaultValue, agentDirectory);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.agentAnimations = this.agent.animations() ?? [];

    const showAgentPromise = this.agent.show();

    // Move the agent to the lower left corner, instead of the lower right.
    await this.agent.moveTo([250, document.documentElement.scrollHeight - 64], 0);

    // Get the clippy references for the close button and add right-click event handlers.
    this.configureClippyEvents();

    if (this.agent.hasAnimation('Greeting')) {
      await this.agent.play('Greeting');
    }

    await showAgentPromise;

    await this.agent.speak(`Guten morgen. Ich bin deine friendly neighborhood ${settings.selectedAgent.value}. How can I help you today?`, true);

    this.canDeleteTimeout = self.setTimeout(() => {
      void (async () => {
        let waveAnimation: Promise<void> | undefined = undefined;
        if (this.agent?.hasAnimation('Wave')) {
          waveAnimation = this.agent.play('Wave');
        }

        const message: string = this.informativeMessages[Math.floor(Math.random() * this.informativeMessages.length)];
        await this.agent?.speak(message, true);

        await waveAnimation;

        if (isSettingEnabledAndTrue(settings.playRandomAnimations)) {
          this.randomize();
        }

        this.clearCanDeleteTimeout();
      })();
    }, 8500);
  }

  private async destroyAgent(): Promise<void> {
    this.clippyAbortController?.abort();
    this.clippyRef = null;
    this.clippySpeechBubbleRef = null;

    this.clearCanDeleteTimeout();
    this.clearAnimationTimeout();
    await this.agent?.destroy();
    this.agentAnimations = [];
    this.agent = undefined;
  }

  private clearAnimationTimeout(): void {
    if (this.animationTimeout) {
      self.clearTimeout(this.animationTimeout);
      this.animationTimeout = undefined;
    }
  }

  private clearCanDeleteTimeout(): void {
    if (this.canDeleteTimeout) {
      self.clearTimeout(this.canDeleteTimeout);
      this.canDeleteTimeout = undefined;
    }
  }

  private configureClippyEvents(): void {
    this.clippyRef = document.getElementById('clippy') as HTMLDivElement | null;
    this.clippySpeechBubbleRef = document.querySelector('.clippy-balloon');

    this.clippyAbortController = new AbortController();

    this.addClippyContextMenuHandler(this.clippyRef, this.clippyAbortController);
    this.addClippyContextMenuHandler(this.clippySpeechBubbleRef, this.clippyAbortController);
  }

  private addClippyContextMenuHandler(element: HTMLDivElement | null, abortController: AbortController): void {
    if (!element) {
      return;
    }

    element.addEventListener('contextmenu', (event) => {
      event.preventDefault();

      if (this.overlayRef && !this.overlayRef.hasAttached() && this.templatePortal) {
        this.overlayRef.attach(this.templatePortal);

        const positionStrategy = this.overlay.position()
          .flexibleConnectedTo(this.clippyRef ?? element)
          .withPositions([
            {
              originX: 'end',
              originY: 'center',
              overlayX: 'start',
              overlayY: 'center',
              offsetX: 0,
              offsetY: -12,
            },
            {
              originX: 'start',
              originY: 'center',
              overlayX: 'center',
              overlayY: 'center',
              offsetX: -48,
              offsetY: -12,
            },
          ])
          .withPush(true);

        this.overlayRef.updatePositionStrategy(positionStrategy);
      }
    }, {
      signal: abortController.signal,
    });
  }
}
