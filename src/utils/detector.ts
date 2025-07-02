import fs from "fs-extra";
import path from "path";
import ora from "ora";
import type { ProjectStructure } from "../types/index.js";

// Helper to detect project structure
export async function detectProjectStructure(): Promise<ProjectStructure> {
  const spinner = ora("🔍 Analyzing project structure...").start();
  
  // Wait a bit longer to ensure all files are written by create-next-app
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const hasSrcDir = fs.existsSync(path.join(process.cwd(), "src"));
  const hasTypeScript = fs.existsSync(path.join(process.cwd(), "tsconfig.json"));
  
  // Check for Tailwind CSS in multiple ways
  const tailwindV3ConfigFiles = [
    "tailwind.config.js",
    "tailwind.config.ts", 
    "tailwind.config.mjs",
    "tailwind.config.cjs"
  ];
  
  const hasTailwindV3Config = tailwindV3ConfigFiles.some(file => 
    fs.existsSync(path.join(process.cwd(), file))
  );
  
  const hasTailwindV4Config = fs.existsSync(path.join(process.cwd(), "postcss.config.mjs"));
  
  let hasTailwindDependency = false;
  let tailwindVersion = "";
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const tailwindDep = (packageJson.dependencies && packageJson.dependencies.tailwindcss) ||
                         (packageJson.devDependencies && packageJson.devDependencies.tailwindcss);
      if (tailwindDep) {
        hasTailwindDependency = true;
        tailwindVersion = tailwindDep;
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  let hasTailwindImports = false;
  try {
    const possibleCssFiles = [
      "src/app/globals.css",
      "app/globals.css", 
      "src/styles/globals.css",
      "styles/globals.css"
    ];
    
    for (const cssFile of possibleCssFiles) {
      const cssPath = path.join(process.cwd(), cssFile);
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, "utf8");
        if (cssContent.includes("@tailwind") || cssContent.includes("tailwindcss")) {
          hasTailwindImports = true;
          break;
        }
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  let hasPostCSSWithTailwind = false;
  try {
    const postcssConfigPath = path.join(process.cwd(), "postcss.config.mjs");
    if (fs.existsSync(postcssConfigPath)) {
      const postcssContent = fs.readFileSync(postcssConfigPath, "utf8");
      if (postcssContent.includes("tailwindcss")) {
        hasPostCSSWithTailwind = true;
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  const useTailwind = hasTailwindV3Config || hasTailwindV4Config || hasTailwindDependency || hasTailwindImports || hasPostCSSWithTailwind;
  
  let detectedVersion = "";
  if (tailwindVersion.includes("4.")) {
    detectedVersion = "v4";
  } else if (tailwindVersion.includes("3.")) {
    detectedVersion = "v3";
  } else if (hasTailwindV4Config || hasPostCSSWithTailwind) {
    detectedVersion = "v4";
  } else if (hasTailwindV3Config) {
    detectedVersion = "v3";
  }
  
  spinner.succeed("Project structure analyzed");
  
  return {
    useSrcDir: hasSrcDir,
    useTypeScript: hasTypeScript,
    useTailwind: useTailwind,
    tailwindVersion: detectedVersion
  };
}