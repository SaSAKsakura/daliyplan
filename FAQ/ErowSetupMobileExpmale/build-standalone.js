const fs = require('fs');
const path = require('path');

const root = __dirname;
const templatePath = path.join(root, 'index.template.html');
const outputPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'styles.css');
const appPath = path.join(root, 'app.js');
const iconRoot = path.join(root, 'assets', 'file-icons');

const iconMimeTypes = {
  '.png': 'image/png'
};

const iconFiles = [
  'pdf.png',
  'txt.png',
  'doc.png',
  'docx.png',
  'excel.png',
  'ppt.png',
  'images.png',
  'audio.png',
  'video.png',
  'zip.png',
  'other.png'
];

const embeddedIcons = Object.fromEntries(iconFiles.map(fileName => {
  const extension = path.extname(fileName).toLowerCase();
  const mimeType = iconMimeTypes[extension];
  const data = fs.readFileSync(path.join(iconRoot, fileName)).toString('base64');
  return [fileName, `data:${mimeType};base64,${data}`];
}));

// 独立文件把源内容嵌入 HTML 中，必须移除各源文件开头的 UTF-8 BOM。
// BOM 位于外部 CSS 文件开头时会被浏览器识别为编码标记；但嵌入 <style>
// 后会成为首个选择器的一部分，导致 `:root` 无法命中，继而让全部 CSS 变量失效。
const stripBom = value => value.replace(/^\uFEFF/, '');
const template = stripBom(fs.readFileSync(templatePath, 'utf8'));
const styles = stripBom(fs.readFileSync(cssPath, 'utf8'));
let app = stripBom(fs.readFileSync(appPath, 'utf8'));

app = app.replace(
  "const fileIconRoot = 'assets/file-icons';",
  `const embeddedFileIcons = Object.freeze(${JSON.stringify(embeddedIcons)});`
);
app = app.replace(
  'return `${fileIconRoot}/${fileTypeIcons[extension] || \'other.png\'}`;',
  "return embeddedFileIcons[fileTypeIcons[extension] || 'other.png'];"
);

if (!app.includes('const embeddedFileIcons = Object.freeze(')) {
  throw new Error('未找到文件图标根路径，无法生成单文件版本。');
}

if (!app.includes("return embeddedFileIcons[fileTypeIcons[extension] || 'other.png'];")) {
  throw new Error('未找到文件图标返回逻辑，无法生成单文件版本。');
}

const inlineStyles = `<style>\n${styles}\n</style>`;
const inlineScript = `<script>\n${app.replace(/<\/script/gi, '<\\/script')}\n</script>`;

const output = template
  .replace(/\s*<link rel="stylesheet" href="styles\.css\?[^\"]+" \/>/, `\n    ${inlineStyles}`)
  .replace(/\s*<script src="app\.js\?[^\"]+"><\/script>/, `\n    ${inlineScript}`);

if (/href="styles\.css|src="app\.js/.test(output)) {
  throw new Error('单文件版本中仍存在外部 CSS 或 JavaScript 引用。');
}

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`已生成独立入口：${outputPath}`);
