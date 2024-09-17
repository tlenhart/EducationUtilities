import { ChangeDetectionStrategy, Component, output, OutputEmitterRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-document-actions',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
  ],
  templateUrl: './document-actions.component.html',
  styleUrl: './document-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentActionsComponent {
  public readonly print: OutputEmitterRef<void> = output<void>();
  public readonly save: OutputEmitterRef<void> = output<void>();
  public readonly reset: OutputEmitterRef<void> = output<void>();
  public readonly downloadPdf: OutputEmitterRef<void> = output<void>();

  public printDocument(): void {
    this.print.emit();
    window.print();
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
