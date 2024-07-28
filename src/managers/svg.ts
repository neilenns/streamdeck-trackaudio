import * as fs from "fs";
import path from "path";

export type CompiledSvgTemplate =
  | ReturnType<typeof Handlebars.compile>
  | undefined;

interface TemplateInfo {
  compiledTemplate: CompiledSvgTemplate;
  lastModified: Date;
}

/**
 * Singleton class that manages compiled SVG templates. This
 * avoids having every action maintain its own compiled SVG templates
 * and unnecessarily compiling templates repeatedly when they
 * are shared across actions.
 */
export default class SvgTemplateManager {
  private static instance: SvgTemplateManager | null = null;
  private templates: Map<string, TemplateInfo>;

  private constructor() {
    this.templates = new Map<string, TemplateInfo>();
  }

  /**
   * Retrieves an instance of the SVG manager.
   * @returns The SVG manager instance
   */
  public static getInstance(): SvgTemplateManager {
    if (!SvgTemplateManager.instance) {
      SvgTemplateManager.instance = new SvgTemplateManager();
    }

    return SvgTemplateManager.instance;
  }

  /**
   * Adds an SVG template to the manager. If the doesn't exist
   * or isn't an SVG then nothing is added. If the file hasn't changed
   * since it was last added then nothing is generated.
   * @param filePath
   */
  public addTemplate(filePath: string): void {
    if (!this.isSvg(filePath)) {
      return;
    }

    try {
      const stats = fs.statSync(filePath);
      const lastModified = stats.mtime;
      const templateInfo = this.templates.get(filePath);

      if (!templateInfo || templateInfo.lastModified < lastModified) {
        const templateContent = fs.readFileSync(filePath, "utf8");
        this.templates.set(filePath, {
          compiledTemplate: Handlebars.compile(templateContent),
          lastModified: lastModified,
        });
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }

  /**
   * Gets the compiled template for a given file path.
   * @param filePath The file path to retrieve the template for.
   * @returns The compiled template or undefined if none is available.
   */
  public getTemplate(filePath: string): CompiledSvgTemplate {
    const templateInfo = this.templates.get(filePath);
    return templateInfo ? templateInfo.compiledTemplate : undefined;
  }

  /**
   *
   * @param filePath The file path to render
   * @param view The replacements to apply to the template
   * @returns The rendered SVG or undefined if there was no template.
   */
  public renderSvg(filePath: string, view: object): string | undefined {
    const template = this.getTemplate(filePath);

    if (!template) {
      return "";
    }

    const renderedSvg = template(view);

    return `data:image/svg+xml;base64,${Buffer.from(
      renderedSvg,
      "utf8"
    ).toString("base64")}`;
  }

  /**
   * Checks to see if a filePath ends in ".svg".
   * @param filePath The path to the file to test
   * @returns True if the filename ends in ".svg"
   */
  public isSvg(filePath: string | undefined) {
    return (
      filePath !== undefined && path.extname(filePath).toLowerCase() === ".svg"
    );
  }
}
