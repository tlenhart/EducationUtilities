import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const asyncExec = promisify(exec);

async function getExecResult(command: string): Promise<string> {
  const commandResult = await asyncExec(command);

  if (commandResult.stderr) {
    throw new Error(`Error while running command ${command}. Result: ${commandResult.stderr}`, { cause: commandResult.stderr });
  }

  return commandResult.stdout;
}

async function updateAppVersion(): Promise<void> {
  const buildDate: string = new Date().toISOString();
  const packageJsonPath: string = await fs.realpath('./package.json');
  const packageJson: string = await fs.readFile(packageJsonPath, { encoding: 'utf8' });
  const packageJsonVersion: string = JSON.parse(packageJson).version;

  const gitVersion: string = (await getExecResult('git rev-parse --short HEAD')).trim();

  console.log(packageJsonVersion, gitVersion, buildDate);

  const versionFileContent: string =
`
import { AppVersion } from '../app/models/app-version.model';

export const packageJsonVersion: string = '${packageJsonVersion}';
export const gitVersion: string = '${gitVersion}';
export const buildDate: string = '${buildDate}';

export const appVersion: AppVersion = { packageJsonVersion, gitVersion, buildDate };
`.trimStart();

  const prodVersionDir = await fs.realpath('./src/environments/');

  await fs.writeFile(`${prodVersionDir}/version.prod.ts`, versionFileContent, { encoding: 'utf8', flag: 'w' });
}

export { updateAppVersion };
