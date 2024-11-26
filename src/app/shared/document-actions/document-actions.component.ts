import { ChangeDetectionStrategy, Component, output, OutputEmitterRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-document-actions',
  imports: [
    MatButton,
    MatIcon,
  ],
  templateUrl: './document-actions.component.html',
  styleUrl: './document-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentActionsComponent {
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  public readonly print: OutputEmitterRef<void> = output<void>();
  public readonly save: OutputEmitterRef<void> = output<void>();
  public readonly reset: OutputEmitterRef<void> = output<void>();
  public readonly downloadPdf: OutputEmitterRef<void> = output<void>();
  /* eslint-enable @typescript-eslint/no-invalid-void-type */

  public printDocument(): void {
    this.print.emit();
    self.print();
  }

  public saveData(): void {
    this.save.emit();
  }

  public resetData(): void {
    this.reset.emit();
  }

  public downloadPdfDocument(): void {
    this.downloadPdf.emit();
  }
}
