import fs from 'fs';
import os from 'os';
import path from 'path';
import execa from 'execa';

import {
  buildAndroid,
  buildHandler,
  buildIOS,
  resolveEntryFile,
} from './build';
import { CliBuildOptions, Config, ConfigEnv } from '../types';
import { Logger } from '../logger';
import * as configHelpers from './config';

describe('build.ts', () => {
  const logger = new Logger();
  const execMock = jest.spyOn(execa, 'command').mockImplementation();
  let entryFile: string;

  beforeEach(() => {
    execMock.mockReset();
    entryFile = resolveEntryFile();
  });

  describe('buildIOS', () => {
    it('builds an iOS project with workspace/scheme', async () => {
      const config: Config & { ios: { env: ConfigEnv } } = {
        ios: {
          workspace: 'ios/RNDemo.xcworkspace',
          scheme: 'RNDemo',
          configuration: 'Debug',
          device: 'iPhone Simulator',
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildIOS(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`,
        { stdio: 'inherit', env: { ENTRY_FILE: entryFile } }
      );
    });

    it('builds an iOS project with scheme with a space in it', async () => {
      const config: Config & { ios: { env: ConfigEnv } } = {
        ios: {
          workspace: 'ios/RNDemo.xcworkspace',
          scheme: 'Demo With Space',
          configuration: 'Debug',
          device: 'iPhone Simulator',
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildIOS(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `xcodebuild -workspace ios/RNDemo.xcworkspace -scheme Demo\\ With\\ Space -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`,
        { stdio: 'inherit', env: { ENTRY_FILE: entryFile } }
      );
    });

    it('builds an iOS project with workspace/scheme - with the quiet arg', async () => {
      const config: Config & { ios: { env: ConfigEnv } } = {
        ios: {
          workspace: 'ios/RNDemo.xcworkspace',
          scheme: 'RNDemo',
          configuration: 'Debug',
          quiet: true,
          device: 'iPhone Simulator',
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildIOS(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet`,
        {
          stdio: 'inherit',
          env: { ENTRY_FILE: entryFile },
        }
      );
    });

    it('builds an iOS project with a custom build command', async () => {
      const config: Config & { ios: { env: ConfigEnv } } = {
        ios: {
          buildCommand: "echo 'Hello World'",
          device: 'iPhone Simulator',
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildIOS(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(`echo 'Hello World'`, {
        stdio: 'inherit',
        env: { ENTRY_FILE: entryFile },
      });
    });
  });

  describe('buildAndroid', () => {
    it('builds an Android project with the default build command', async () => {
      const config: Config & { android: { env: ConfigEnv } } = {
        android: {
          packageName: 'com.rndemo',
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildAndroid(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `./gradlew assembleRelease --console plain -PisOwlBuild=true`,
        {
          stdio: 'inherit',
          cwd: path.join(process.cwd(), 'android'),
          env: { ENTRY_FILE: entryFile },
        }
      );
    });

    it('builds an Android project with the default build command - with the quiet arg', async () => {
      const config: Config & { android: { env: ConfigEnv } } = {
        android: {
          packageName: 'com.rndemo',
          quiet: true,
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildAndroid(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `./gradlew assembleRelease --console plain --quiet -PisOwlBuild=true`,
        {
          stdio: 'inherit',
          cwd: path.join(process.cwd(), 'android'),
          env: { ENTRY_FILE: entryFile },
        }
      );
    });

    it('builds an Android project with a custom build command', async () => {
      const config: Config & { android: { env: ConfigEnv } } = {
        android: {
          packageName: 'com.rndemo',
          buildCommand: "echo 'Hello World'",
          env: { ENTRY_FILE: entryFile },
        },
      };

      await buildAndroid(config, logger);

      expect(execMock).toHaveBeenCalledTimes(1);
      expect(execMock).toHaveBeenCalledWith(
        `echo 'Hello World' -PisOwlBuild=true`,
        {
          stdio: 'inherit',
          env: { ENTRY_FILE: entryFile },
        }
      );
    });
  });

  describe('resolveEntryFile', () => {
    const tempDirs: string[] = [];

    afterEach(() => {
      while (tempDirs.length) {
        const dir = tempDirs.pop();
        if (dir) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
    });

    it('prefers the node_modules entry file when present', () => {
      const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'owl-entry-node-modules-')
      );
      tempDirs.push(tempDir);
      const entryDir = path.join(
        tempDir,
        'node_modules',
        'react-native-owl',
        'dist',
        'client'
      );
      fs.mkdirSync(entryDir, { recursive: true });
      fs.writeFileSync(path.join(entryDir, 'index.app.js'), '');

      expect(resolveEntryFile(tempDir)).toBe(
        path.join(
          tempDir,
          'node_modules',
          'react-native-owl',
          'dist',
          'client',
          'index.app.js'
        )
      );
    });

    it('falls back to the parent dist folder when using a local checkout', () => {
      const workspaceDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'owl-entry-workspace-')
      );
      tempDirs.push(workspaceDir);
      const distDir = path.join(workspaceDir, 'dist', 'client');
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.app.js'), '');

      const exampleDir = path.join(workspaceDir, 'example');
      fs.mkdirSync(exampleDir);

      expect(resolveEntryFile(exampleDir)).toBe(
        path.join(workspaceDir, 'dist', 'client', 'index.app.js')
      );
    });

    it('falls back to the local dist folder when available', () => {
      const projectDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'owl-entry-project-')
      );
      tempDirs.push(projectDir);
      const distDir = path.join(projectDir, 'dist', 'client');
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.app.js'), '');

      expect(resolveEntryFile(projectDir)).toBe(
        path.join(projectDir, 'dist', 'client', 'index.app.js')
      );
    });
  });

  describe('buildHandler', () => {
    const args = {
      platform: 'ios',
      config: './owl.config.json',
    } as CliBuildOptions;

    const createConfig = (
      entry: string
    ): Config & {
      android: { env: ConfigEnv };
      ios: { env: ConfigEnv };
    } => ({
      ios: {
        buildCommand: "echo 'Hello World'",
        device: 'iPhone Simulator',
        env: { ENTRY_FILE: entry },
      },
      android: {
        packageName: 'com.rndemo',
        buildCommand: "echo 'Hello World'",
        env: { ENTRY_FILE: entry },
      },
    });

    jest.spyOn(Logger.prototype, 'print').mockImplementation();

    it('builds an iOS project', async () => {
      const config = createConfig(entryFile);
      jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
      const call = async () => buildHandler(args);
      await expect(call()).resolves.not.toThrow();
    });

    it('builds an Android project', async () => {
      const config = createConfig(entryFile);
      jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
      const call = async () => buildHandler({ ...args, platform: 'android' });
      await expect(call()).resolves.not.toThrow();
    });
  });
});
