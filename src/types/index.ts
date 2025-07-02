export interface ProjectConfig {
    projectName: string;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
    shadcn: boolean;
    nextauth: boolean;
    useTurbopack: boolean;
  }
  
  export interface ProjectStructure {
    useSrcDir: boolean;
    useTypeScript: boolean;
    useTailwind: boolean;
    tailwindVersion: string;
  }