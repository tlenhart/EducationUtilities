import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Agent, load as loadAgent } from 'clippy.modern';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../core/settings/settings.service';
import { ClippySettings } from '../../models';
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

  constructor() {
    this.subscriptions.add(toObservable(this.settingsService.settings).subscribe(async (settings) => {
      // console.log('settings changed');
      await this.loadAgent(settings.clippy);
    }));
  }

  public async ngOnDestroy(): Promise<void>{
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

    this.animationTimeout = window.setTimeout(async () => {
      // Pick a random animation so we can see what it is.
      const animation: string = this.agentAnimations[Math.floor(Math.random() * this.agentAnimations.length)];
      // console.log('animation', animation);
      await this.agent?.speak(`Playing the ${animation} animation.`, true);

      // Play the animation.
      // You can also use `await this.agent?.animate();` if you want the library to handle the random animation.
      try {
        await this.agent?.play(animation);
      } catch (error: unknown) {
        console.warn(error);
      }

      // Clear the timeout value so it can be set again.
      this.clearAnimationTimeout();

      // Set the timeout for the next randomization instance.
      this.randomize();
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

    this.agent = await loadAgent(settings.selectedAgent.value || settings.selectedAgent.defaultValue, agentDirectory);
    this.agentAnimations = this.agent.animations() ?? [];

    const showAgentPromise = this.agent.show();

    // Move the agent to the lower left corner, instead of the lower right.
    await this.agent.moveTo([40, document.documentElement.scrollHeight - 50], 0);

    if (this.agent.hasAnimation('Greeting')) {
      await this.agent.play('Greeting');
    }

    await showAgentPromise;

    await this.agent.speak(`Guten morgen. Ich bin deine friendly neighborhood ${settings.selectedAgent.value}. How can I help you today?`, true);

    this.canDeleteTimeout = window.setTimeout(async () => {
      let waveAnimation: Promise<void> | undefined = undefined;
      if (this.agent?.hasAnimation('Wave')) {
        waveAnimation = this.agent?.play('Wave');
      }

      await this.agent?.speak(`Did you know that you can get rid of me in the settings?\n I'll be really sad, but it can be done.`, true);

      await waveAnimation;

      if (isSettingEnabledAndTrue(settings.playRandomAnimations)) {
        this.randomize();
      }

      this.clearCanDeleteTimeout();
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
    window.clearTimeout(this.animationTimeout);
    this.animationTimeout = undefined;
  }

  private clearCanDeleteTimeout(): void {
    window.clearTimeout(this.canDeleteTimeout);
    this.canDeleteTimeout = undefined;
  }
}
