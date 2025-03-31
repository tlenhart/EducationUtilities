import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppDialogService } from '../../core/app-dialog/app-dialog.service';
import { CreateObservationSessionResult } from '../../models/observation.model';
import {
  LinkableNavigationCardComponent,
} from '../../shared/linkable-navigation-card/linkable-navigation-card.component';
import { FrequencyDataSplitPaneStore } from '../../shared/stores/frequency-data-split-pane.store';
import { frequencyRouteKeys } from '../frequency-base.routes';

@Component({
  selector: 'eu-frequency-dashboard',
  imports: [
    LinkableNavigationCardComponent,
  ],
  templateUrl: './frequency-dashboard.component.html',
  styleUrl: './frequency-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyDashboardComponent implements OnDestroy {
  public readonly frequencyDataSplitPanelStore = inject(FrequencyDataSplitPaneStore);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly dialogService: AppDialogService = inject(AppDialogService);

  private createObservationSession$?: Subscription;

  public ngOnDestroy(): void {
    this.createObservationSession$?.unsubscribe();
  }

  public openCreateObservationSessionDialog(): void {
    // TODO: Handle errors.

    this.createObservationSession$?.unsubscribe();

    const dialogRef = this.dialogService.buildNewObservationSessionDialog(
      this.viewContainerRef,
    );

    this.createObservationSession$ = dialogRef.afterClosed().subscribe({
      next: (createdObservation: CreateObservationSessionResult | undefined) => {
        if (createdObservation?.success) {
          void (async () => {
            try {
              await this.router.navigate(
                ['../', frequencyRouteKeys.base.record, 'observation-session-form', createdObservation.sessionId],
                { relativeTo: this.route },
              );
            } catch (error: unknown) {
              console.error('routing failure for observation session', error);
            }
          })();
        }
      },
    });
  }
}
