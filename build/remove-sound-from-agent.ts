import fs from 'node:fs/promises';
import { chdir } from 'node:process';

/**
 * Remove sound data from all clippy and friends agents.
 * @param {string} noSoundBaseDirectory Base directory containing agent directories for agents that should have their sound removed.
 * @returns {Promise<void>} Awaitable.
 */
async function removeSoundFromAllAgents(noSoundBaseDirectory: string): Promise<void> {
  const cwd: string = process.cwd();

  // TODO: Add try/catch statements and make sure you always revert back to the starting directory.
  const noSoundDirectory = await fs.readdir(noSoundBaseDirectory);
  for (const directory of noSoundDirectory) {
    chdir(`${noSoundBaseDirectory}/${directory}`);
    await removeSoundFromAgent(`./`);
  }

  chdir(cwd);
}

/**
 * Remove sound data from a specific clippy and friends agent directory.
 * @param {string} agentJsonDirectory The directory to remove agent sound data from.
 * @returns {Promise<void>} Awaitable.
 */
async function removeSoundFromAgent(agentJsonDirectory: string): Promise<void> {
  const directoryInfo: Array<string> = await fs.readdir(agentJsonDirectory);

  for (const file of directoryInfo) {
    // file === 'sounds-mp3.json' || file === 'sounds-ogg.json'
    if (/^sounds-.*?\.json$/i.test(file)) {
      // Clear out all sound values to ensure that even if a sounds json file is loaded, it doesn't load a larger file that contains the sounds.
      const jsonSoundData = await fs.readFile(file, 'utf8');
      const soundData = JSON.parse(jsonSoundData);

      for (const soundKey in soundData) {
        soundData[soundKey] = '';
      }

      // Overwrite the original sound data file with a sound data file containing no sounds.
      await fs.writeFile(`${agentJsonDirectory}/${file}`, JSON.stringify(soundData, undefined, undefined), { encoding: 'utf8' });
    } else if (file === 'agent.json') {
      const jsonAgentData = await fs.readFile(file, 'utf8');
      const agentData = JSON.parse(jsonAgentData);

      // Delete sound properties from the animation frames to prevent them from being played.
      for (const animation in agentData.animations) {
        for (const frame of agentData.animations[animation].frames) {
          delete frame.sound;
        }
      }

      // Write the updated agent.json file.
      await fs.writeFile(`${agentJsonDirectory}/${file}`, JSON.stringify(agentData, undefined, undefined), { encoding: 'utf8' });
    }
  }
}

export { removeSoundFromAllAgents, removeSoundFromAgent };
