import fs from 'node:fs/promises';
import { chdir } from 'node:process';
import { removeSoundFromAllAgents } from './remove-sound-from-agent';

/**
 * Create the no-sound clippy and friends agent directories.
 * @returns {Promise<void>} Awaitable.
 */
async function createNoSoundAgentDirectories(): Promise<void> {
  const cwd = process.cwd();
  const rootDir = await fs.realpath('./node_modules/clippy.modern/dist');

  // Move to the dist directory so we can do something.
  chdir(rootDir);
  const agentsDirectory: string = './agents';
  const agentsNoSoundDirectory = './agents-no-sound';

  if ((await fs.readdir('./')).includes(agentsNoSoundDirectory)) {
    await fs.rm(agentsNoSoundDirectory, { recursive: true });
  }

  // Copy the agents directory to a no-sound directory.
  await fs.cp(agentsDirectory, `${agentsNoSoundDirectory}/`, { recursive: true });

  // Restore original directory so the "full" path can be sent to the copy function.
  chdir(cwd);

  await removeSoundFromAllAgents(`${rootDir}/${agentsNoSoundDirectory}`);
}

// Create the no-sound/ agent directories after installing packages.
await createNoSoundAgentDirectories();
