import { FormControl } from '@angular/forms';
import { FullVersionInfo } from './app-version.model';

export type FeedbackType = 'bug' | 'feature' | 'accessibility' | 'other';

export interface Feedback {
  doesNotContainPrivateInformation: boolean;
  feedbackMessage: string;
  secret: string;
  type: FeedbackType;
  utility: string; // Route.
  version: FullVersionInfo;
}

export type FeedbackForm = {
  [K in keyof Feedback]: FormControl<Feedback[K]>;
};
