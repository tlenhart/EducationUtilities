import fs from 'node:fs/promises';
import { chdir } from 'node:process';

export async function copy3rdPartyLicenses(pathTo3rdPartyDirectory: string): Promise<void> {
  const cwd: string = process.cwd();

  // Change to the directory containing the 3rdPartyLicenses.txt file.
  chdir(pathTo3rdPartyDirectory);

  // Copy the file to the browser directory.
  await fs.copyFile('./3rdpartylicenses.txt', `${pathTo3rdPartyDirectory}/browser/3rdpartylicenses.txt`);

  // Change back to the original directory.
  chdir(cwd);
}
