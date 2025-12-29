#!/usr/bin/env tsx
/**
 * Script to import and adapt code from Lovable.dev project
 * 
 * Usage:
 *   npm run import:lovable <path-to-lovable-project>
 * 
 * This script will:
 * 1. Analyze the Lovable project structure
 * 2. Copy and adapt components
 * 3. Update imports to use @/ aliases
 * 4. Check for missing dependencies
 * 5. Generate a report of changes
 */

import * as fs from "fs";
import * as path from "path";

interface ImportStats {
  componentsCopied: number;
  pagesAdapted: number;
  dependenciesAdded: string[];
  errors: string[];
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("❌ Error: Please provide path to Lovable project");
    console.log("\nUsage: npm run import:lovable <path-to-lovable-project>");
    process.exit(1);
  }

  const lovablePath = path.resolve(args[0]);
  const projectRoot = path.resolve(__dirname, "..");

  if (!fs.existsSync(lovablePath)) {
    console.error(`❌ Error: Path does not exist: ${lovablePath}`);
    process.exit(1);
  }

  console.log("🚀 Starting Lovable import process...\n");
  console.log(`📁 Lovable project: ${lovablePath}`);
  console.log(`📁 Target project: ${projectRoot}\n`);

  const stats: ImportStats = {
    componentsCopied: 0,
    pagesAdapted: 0,
    dependenciesAdded: [],
    errors: [],
  };

  try {
    // Analyze Lovable project structure
    console.log("📊 Analyzing Lovable project structure...");
    const structure = analyzeStructure(lovablePath);
    
    // Copy components
    if (structure.componentsDir) {
      console.log("\n📦 Copying components...");
      copyComponents(
        structure.componentsDir,
        path.join(projectRoot, "components"),
        stats
      );
    }

    // Adapt pages
    if (structure.pagesDir) {
      console.log("\n📄 Adapting pages...");
      adaptPages(
        structure.pagesDir,
        path.join(projectRoot, "app"),
        stats
      );
    }

    // Check dependencies
    console.log("\n🔍 Checking dependencies...");
    checkDependencies(lovablePath, projectRoot, stats);

    // Generate report
    console.log("\n" + "=".repeat(50));
    console.log("📋 Import Summary");
    console.log("=".repeat(50));
    console.log(`✅ Components copied: ${stats.componentsCopied}`);
    console.log(`✅ Pages adapted: ${stats.pagesAdapted}`);
    console.log(`📦 Dependencies to add: ${stats.dependenciesAdded.length}`);
    
    if (stats.dependenciesAdded.length > 0) {
      console.log("\n⚠️  Missing dependencies detected:");
      stats.dependenciesAdded.forEach((dep) => console.log(`   - ${dep}`));
      console.log("\n💡 Run: npm install " + stats.dependenciesAdded.join(" "));
    }

    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log("\n✨ Import process completed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Review the imported files");
    console.log("   2. Run: npm run lint:fix");
    console.log("   3. Run: npm run format");
    console.log("   4. Fix any TypeScript errors");
    console.log("   5. Translate UI texts to Russian");
    console.log("   6. Adapt data fetching to use TanStack Query");

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

interface ProjectStructure {
  componentsDir?: string;
  pagesDir?: string;
  appDir?: string;
  srcDir?: string;
}

function analyzeStructure(lovablePath: string): ProjectStructure {
  const structure: ProjectStructure = {};
  const entries = fs.readdirSync(lovablePath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirName = entry.name.toLowerCase();
      const fullPath = path.join(lovablePath, entry.name);

      if (dirName === "components" || dirName === "component") {
        structure.componentsDir = fullPath;
      } else if (dirName === "pages" || dirName === "page") {
        structure.pagesDir = fullPath;
      } else if (dirName === "app") {
        structure.appDir = fullPath;
      } else if (dirName === "src") {
        structure.srcDir = fullPath;
        // Recursively check src directory
        const srcStructure = analyzeStructure(fullPath);
        Object.assign(structure, srcStructure);
      }
    }
  }

  return structure;
}

function copyComponents(
  sourceDir: string,
  targetDir: string,
  stats: ImportStats
) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = getAllFiles(sourceDir, [".tsx", ".ts", ".jsx", ".js"]);

  for (const file of files) {
    try {
      const relativePath = path.relative(sourceDir, file);
      const targetPath = path.join(targetDir, relativePath);
      const targetDirPath = path.dirname(targetPath);

      // Create target directory if needed
      if (!fs.existsSync(targetDirPath)) {
        fs.mkdirSync(targetDirPath, { recursive: true });
      }

      // Read and adapt file content
      let content = fs.readFileSync(file, "utf-8");
      content = adaptImports(content, file, targetPath);
      content = addClientDirectiveIfNeeded(content, file);

      // Write adapted content
      fs.writeFileSync(targetPath, content, "utf-8");
      stats.componentsCopied++;
      console.log(`   ✓ ${relativePath}`);
    } catch (error) {
      const errorMsg = `Failed to copy ${file}: ${error}`;
      stats.errors.push(errorMsg);
      console.error(`   ✗ ${path.relative(sourceDir, file)}: ${error}`);
    }
  }
}

function adaptPages(
  sourceDir: string,
  targetDir: string,
  stats: ImportStats
) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = getAllFiles(sourceDir, [".tsx", ".ts", ".jsx", ".js"]);

  for (const file of files) {
    try {
      const relativePath = path.relative(sourceDir, file);
      // Adapt Next.js routing structure
      let targetPath = path.join(targetDir, relativePath);
      
      // Convert page.tsx structure if needed
      if (file.endsWith("page.tsx") || file.endsWith("index.tsx")) {
        const dirName = path.dirname(relativePath);
        targetPath = path.join(targetDir, dirName, "page.tsx");
      }

      const targetDirPath = path.dirname(targetPath);
      if (!fs.existsSync(targetDirPath)) {
        fs.mkdirSync(targetDirPath, { recursive: true });
      }

      // Read and adapt file content
      let content = fs.readFileSync(file, "utf-8");
      content = adaptImports(content, file, targetPath);
      content = addClientDirectiveIfNeeded(content, file);
      content = adaptDataFetching(content);

      // Write adapted content
      fs.writeFileSync(targetPath, content, "utf-8");
      stats.pagesAdapted++;
      console.log(`   ✓ ${relativePath} → ${path.relative(targetDir, targetPath)}`);
    } catch (error) {
      const errorMsg = `Failed to adapt page ${file}: ${error}`;
      stats.errors.push(errorMsg);
      console.error(`   ✗ ${path.relative(sourceDir, file)}: ${error}`);
    }
  }
}

function adaptImports(
  content: string,
  sourceFile: string,
  _targetFile: string
): string {
  // Replace relative imports with @/ aliases
  const lines = content.split("\n");
  const adaptedLines = lines.map((line) => {
    // Match import statements
    const importMatch = line.match(/^import\s+.*from\s+['"](.+?)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      
      // Skip node_modules and external packages
      if (
        !importPath.startsWith(".") &&
        !importPath.startsWith("/") &&
        !importPath.startsWith("@/")
      ) {
        return line;
      }

      // Convert relative paths to @/ aliases
      if (importPath.startsWith(".") || importPath.startsWith("/")) {
        const sourceDir = path.dirname(sourceFile);
        const resolvedPath = path.resolve(sourceDir, importPath);
        const projectRoot = path.resolve(__dirname, "..");
        const relativeToRoot = path.relative(projectRoot, resolvedPath);
        
        if (!relativeToRoot.startsWith("..")) {
          const aliasPath = relativeToRoot
            .replace(/\\/g, "/")
            .replace(/\.(tsx?|jsx?)$/, "");
          return line.replace(importPath, `@/${aliasPath}`);
        }
      }
    }
    return line;
  });

  return adaptedLines.join("\n");
}

function addClientDirectiveIfNeeded(content: string, filePath: string): string {
  // Check if component uses client-side features
  const needsClient =
    content.includes("useState") ||
    content.includes("useEffect") ||
    content.includes("useQuery") ||
    content.includes("useMutation") ||
    content.includes("onClick") ||
    content.includes("onChange") ||
    content.includes("event") ||
    filePath.includes("client") ||
    filePath.includes("Client");

  if (needsClient && !content.includes('"use client"')) {
    return '"use client";\n\n' + content;
  }

  return content;
}

function adaptDataFetching(content: string): string {
  // This is a placeholder - actual adaptation would need more context
  // Replace direct fetch calls with TanStack Query hooks
  // This would require AST parsing for proper implementation
  
  // Simple regex-based replacement (basic)
  if (content.includes("fetch(") && !content.includes("useQuery")) {
    console.log("   ⚠️  Warning: Direct fetch() detected - needs manual adaptation to TanStack Query");
  }

  return content;
}

function checkDependencies(
  lovablePath: string,
  projectRoot: string,
  stats: ImportStats
) {
  const lovablePackageJson = path.join(lovablePath, "package.json");
  const projectPackageJson = path.join(projectRoot, "package.json");

  if (!fs.existsSync(lovablePackageJson)) {
    console.log("   ⚠️  No package.json found in Lovable project");
    return;
  }

  const lovablePkg = JSON.parse(
    fs.readFileSync(lovablePackageJson, "utf-8")
  );
  const projectPkg = JSON.parse(
    fs.readFileSync(projectPackageJson, "utf-8")
  );

  const lovableDeps = {
    ...lovablePkg.dependencies,
    ...lovablePkg.devDependencies,
  };
  const projectDeps = {
    ...projectPkg.dependencies,
    ...projectPkg.devDependencies,
  };

  for (const [dep, version] of Object.entries(lovableDeps)) {
    if (!projectDeps[dep] && !dep.startsWith("@types/")) {
      stats.dependenciesAdded.push(`${dep}@${version}`);
    }
  }
}

function getAllFiles(
  dirPath: string,
  extensions: string[]
): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and .next
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

main();
