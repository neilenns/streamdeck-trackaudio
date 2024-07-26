import * as fs from "fs";
import Handlebars from "handlebars";

export default function generateSvgForSetImage(
  templatePath: string,
  replacements: Record<string, unknown>
): string {
  let svgContent: string;

  try {
    svgContent = fs.readFileSync(templatePath, "utf8");
  } catch (err) {
    console.error(err);
    return "";
  }

  // Compile the Handlebars template
  const template = Handlebars.compile(svgContent);

  // Render the SVG content with Handlebars replacements
  const renderedSvg = template(replacements);

  return `data:image/svg+xml;base64,${Buffer.from(renderedSvg, "utf8").toString(
    "base64"
  )}`;
}
