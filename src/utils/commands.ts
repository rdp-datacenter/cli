import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import type { ProjectConfig } from "../types/index.js";

// Helper to run shell commands with better error handling and spinner
export function run(cmd: string, message?: string): void {
  const spinner = message ? ora(message).start() : null;
  try {
    execSync(cmd, { stdio: "pipe" });
    if (spinner) {
      spinner.succeed(message);
    }
  } catch (error) {
    if (spinner) {
      spinner.fail(`Failed: ${message || cmd}`);
    }
    console.error(chalk.red(`❌ Error running command: ${cmd}`));
    process.exit(1);
  }
}

// Helper to run shell commands with inherit stdio (for interactive commands)
export function runInteractive(cmd: string): void {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red(`❌ Error running command: ${cmd}`));
    process.exit(1);
  }
}

// Helper to get install command based on package manager
export function getInstallCommand(packageManager: ProjectConfig['packageManager']): string {
  const commands = {
    npm: "npm install",
    yarn: "yarn add",
    pnpm: "pnpm add",
    bun: "bun add"
  };
  return commands[packageManager];
}

// Helper to get dev command based on package manager
export function getDevCommand(packageManager: ProjectConfig['packageManager'], useTurbopack: boolean = false): string {
  const turboFlag = useTurbopack ? " --turbo" : "";
  const commands = {
    npm: `npm run dev${turboFlag}`,
    yarn: `yarn dev${turboFlag}`,
    pnpm: `pnpm dev${turboFlag}`,
    bun: `bun dev${turboFlag}`
  };
  return commands[packageManager];
}