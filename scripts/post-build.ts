// Actions to be run post-build to modify the output file(s).

// During the build, the Angular build process will copy the agent directories to both a sound/ and no-sound/ output directory.
// We need to manually modify the no-sound files to remove the associated sounds. (Although this may have occurred already during npm install.)

import fs from 'node:fs/promises';
import { removeSoundFromAllAgents } from './remove-sound-from-agent';
import { copy3rdPartyLicenses } from './copy-3rd-party-licenses';

async function postBuild(): Promise<void> {
  // Get no-sound agent directories.
  const baseDirectory: string = await fs.realpath('./dist/education-utilities/browser/agents-no-sound');

  await removeSoundFromAllAgents(baseDirectory);

  const thirdPartyLicenseDirectory: string = await fs.realpath('./dist/education-utilities');

  await copy3rdPartyLicenses(thirdPartyLicenseDirectory);
}

export { postBuild };
