import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { BehaviorId, ObservationBehavior } from '../../../models/observation.model';
import { EntitySelectorComponent } from '../../../shared/entity-selector/entity-selector.component';
import { ObservationBehaviorStore } from '../../../shared/stores/observation-behavior.store';
import { buildWidthString } from '../../../utils/css.utils';
import {
  AddObservationBehaviorDialogComponent,
} from './add-observation-behavior-dialog/add-observation-behavior-dialog.component';

@Component({
  selector: 'eu-all-observation-behaviors-configuration',
  imports: [
    RouterOutlet,
    EntitySelectorComponent,
  ],
  templateUrl: './all-observation-behaviors-configuration.component.html',
  styleUrl: './all-observation-behaviors-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllObservationBehaviorsConfigurationComponent implements OnDestroy {
  public readonly observationBehaviorStore = inject(ObservationBehaviorStore);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private addNewObservationBehaviorSubscription?: Subscription;

  public ngOnDestroy(): void {
    this.addNewObservationBehaviorSubscription?.unsubscribe();
  }

  public async selectObservationBehavior(observationBehavior: ObservationBehavior | null): Promise<void> {
    if (observationBehavior) {
      try {
        await this.router.navigate([observationBehavior.id], { relativeTo: this.route });
      } catch (error: unknown) {
        console.error('routing failure for observation behavior', error);
      }
    }
  }

  public addNewObservationBehavior(): void {
    // TODO: Handle errors.

    this.addNewObservationBehaviorSubscription?.unsubscribe();

    const dialogRef = this.dialog.open<AddObservationBehaviorDialogComponent, unknown, BehaviorId>(AddObservationBehaviorDialogComponent, {
      ariaLabel: 'Add student dialog',
      autoFocus: 'first-tabbable',
      closeOnNavigation: true,
      disableClose: false,
      hasBackdrop: true,
      restoreFocus: true,
      role: 'dialog',
      viewContainerRef: this.viewContainerRef, // To allow the observationBehaviorStore to be accessed in the dialog. (If it was not provided in root.)
      width: buildWidthString(`300px`, `600px`, `100vw`),
    });

    this.addNewObservationBehaviorSubscription = dialogRef.afterClosed().subscribe({
      next: (createdObservationId: BehaviorId | undefined) => {
        if (createdObservationId) {
          void (async () => {
            await this.selectObservationBehavior(this.observationBehaviorStore.entityMap()[createdObservationId]);
          })();
        }
      },
    });
  }
}
