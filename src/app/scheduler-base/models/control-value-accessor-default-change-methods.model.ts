import { signal, WritableSignal } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class ControlValueAccessorDefaultChangeMethods<T> {
  public readonly isDisabled: WritableSignal<boolean> = signal(false);
  public readonly isTouched: WritableSignal<boolean> = signal(false);

  // Initial implementation for onChange. Replaced at runtime with an Angular function.
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public onChange: (changeValue: T) => void = (changeValue: T) => {
  };

  // Initial implementation for onTouched. Replaced at runtime with an Angular function.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched = () => {
  };

  public markAsTouched(): void {
    if (!this.isTouched()) {
      this.isTouched.set(true);
      this.onTouched();
    }
  }
}
