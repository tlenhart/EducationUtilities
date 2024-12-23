import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Agent, load as loadAgent } from 'clippy.modern';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../core/settings/settings.service';
import { ClippySettings } from '../../models';
import { sleep } from '../../utils/promise.utils';
import { isGlobalSettingEnabled, isSettingEnabledAndTrue } from '../../utils/setting.utils';

@Component({
  selector: 'app-clippy',
  standalone: true,
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClippyComponent implements OnDestroy {
  private readonly settingsService: SettingsService = inject(SettingsService);
  private readonly subscriptions: Subscription = new Subscription();
  private agent?: Agent;
  private agentAnimations: ReadonlyArray<string> = [];
  private animationTimeout: number | undefined = undefined;
  private canDeleteTimeout: number | undefined = undefined;
  private readonly informativeMessages: ReadonlyArray<string> = [
    `Did you know that you can get rid of me in the settings?\n I'll be really sad, but it can be done.`,
    `Tooltips when hovering over grid show/hide checkboxes can be disabled in the settings if they are annoying.`,
  ];

  constructor() {
    this.subscriptions.add(toObservable(this.settingsService.settings).subscribe({
      next: (settings) => {
        void (async () => {
          await this.loadAgent(settings.clippy);
        })();
      },
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  public async ngOnDestroy(): Promise<void> {
    this.subscriptions.unsubscribe();
    await this.destroyAgent();
  }

  public randomize(): void {
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
    await this.agent.moveTo([40, document.documentElement.scrollHeight - 50], 0);

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
}
