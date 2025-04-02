import { getIncrementor } from './number-utils';

export const getSequentialId: Generator<string, never, string> = getIncrementor();

export async function copyToClipboard(content: string): Promise<void> {
  const contentType: string = 'text/plain';
  const contentBlob: Blob = new Blob([content], { type: contentType });
  const data = [new ClipboardItem({ [contentType]: contentBlob })];
  await navigator.clipboard.write(data);
}
