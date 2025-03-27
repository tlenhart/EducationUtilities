import { inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  NewObservationSessionDialogData,
} from '../../frequency/frequency-record/observation-session/new-observation-session-dialog/new-observation-session-dialog-data.model';
import {
  NewObservationSessionDialogComponent,
} from '../../frequency/frequency-record/observation-session/new-observation-session-dialog/new-observation-session-dialog.component';
import { CreateObservationSessionResult } from '../../models/observation.model';

@Injectable({
  providedIn: 'root',
})
export class AppDialogService {

  private readonly dialog: MatDialog = inject(MatDialog);

  public buildNewObservationSessionDialog(viewContainerRef: ViewContainerRef, data?: NewObservationSessionDialogData): MatDialogRef<NewObservationSessionDialogComponent, CreateObservationSessionResult> {
    return this.dialog.open<NewObservationSessionDialogComponent, NewObservationSessionDialogData, CreateObservationSessionResult>(
      NewObservationSessionDialogComponent,
      {
        ariaLabel: 'Create new observation session dialog',
        autoFocus: 'dialog',
        closeOnNavigation: true,
        data: data ?? null,
        disableClose: false,
        hasBackdrop: true,
        height: 'auto',
        restoreFocus: true,
        role: 'dialog',
        viewContainerRef: viewContainerRef, // To allow the observationBehaviorStore to be accessed in the dialog. (If it was not provided in root.)
        width: 'min(450px, 100vw)',
      });
  }
}
