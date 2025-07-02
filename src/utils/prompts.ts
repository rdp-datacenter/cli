import inquirer from "inquirer";
import chalk from "chalk";
import type { ProjectConfig } from "../types/index.js";

export async function getBasicProjectInfo(): Promise<Pick<ProjectConfig, 'projectName' | 'packageManager'>> {
  return inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: chalk.cyan("🎯 What is your project name?"),
      default: "my-awesome-app",
      validate: (input: string) =>
        /^[a-zA-Z0-9-_]+$/.test(input) || chalk.red("Use only letters, numbers, - and _"),
    },
    {
      type: "list",
      name: "packageManager",
      message: chalk.cyan("📦 Which package manager would you like to use?"),
      choices: [
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
        { name: "pnpm (recommended)", value: "pnpm" },
        { name: "bun (fastest)", value: "bun" }
      ],
      default: "pnpm",
    },
  ]);
}

export async function getFeatureOptions(): Promise<Pick<ProjectConfig, 'shadcn' | 'nextauth' | 'useTurbopack'>> {
  return inquirer.prompt([
    {
      type: "confirm",
      name: "shadcn",
      message: chalk.cyan("🎨 Add shadcn/ui for beautiful components? (requires Tailwind CSS)"),
      default: true,
    },
    {
      type: "confirm",
      name: "nextauth",
      message: chalk.cyan("🔐 Add NextAuth.js for authentication?"),
      default: false,
    },
    {
      type: "confirm",
      name: "useTurbopack",
      message: chalk.cyan("⚡ Enable Turbopack for faster development?"),
      default: true,
    },
  ]);
}