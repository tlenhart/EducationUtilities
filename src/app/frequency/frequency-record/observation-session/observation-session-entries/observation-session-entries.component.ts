import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ObservationEntry, ObservationEntryId } from '../../../../models/observation.model';
import { SettingsStore } from '../../../../settings/settings.store';
import { ZonedDateTimePipe } from '../../../../shared/pipes/zoned-date-time/zoned-date-time.pipe';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';

@Component({
  selector: 'eu-observation-session-entries',
  imports: [
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    MatIcon,
    MatIconButton,
    ZonedDateTimePipe,
  ],
  templateUrl: './observation-session-entries.component.html',
  styleUrl: './observation-session-entries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationSessionEntriesComponent {
  /*
   * DI Dependencies
   */
  public readonly settingsStore = inject(SettingsStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);

  /*
   * Inputs
   */

  /**
   * Whether or not the delete button should be enabled.
   * @type {InputSignal<boolean>}
   */
  public readonly showDeleteButton: InputSignal<boolean> = input(true);

  /**
   * Observation entries to display.
   * @type {InputSignal<ObservationEntry[]>}
   */
  public readonly entries: InputSignal<Array<ObservationEntry>> = input.required<Array<ObservationEntry>>();

  /*
   * Outputs
   */

  /**
   * Event triggered after clicking on the delete button for an entry.
   * @type {OutputEmitterRef<number>}
   */
  public readonly deleteObservationEntry: OutputEmitterRef<ObservationEntryId> = output<ObservationEntryId>();

  public readonly itemSize: number = 41;

  public trackEntry(index: number, item: ObservationEntry): number {
    return item.id;
  }

  public deleteEntry(entryId: ObservationEntryId): void {
    this.deleteObservationEntry.emit(entryId);
  }
}
