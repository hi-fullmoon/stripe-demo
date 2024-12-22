import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateERD() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  // 解析模型和枚举
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
  const models = {};
  const modelComments = {};
  const enums = {};
  const relations = [];

  // 解析枚举
  let enumMatch;
  while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
    const enumName = enumMatch[1];
    const enumContent = enumMatch[2];
    enums[enumName] = enumContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
      .map((line) => line.split('//')[0].trim());
  }

  // 解析模型
  let modelMatch;
  while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
    const modelName = modelMatch[1];
    const modelContent = modelMatch[2];
    models[modelName] = [];

    // 获取模型注释
    const modelCommentMatch = schemaContent
      .substring(0, modelMatch.index)
      .split('\n')
      .reverse()
      .find((line) => line.trim().startsWith('//'));
    modelComments[modelName] = modelCommentMatch ? modelCommentMatch.trim().substring(2).trim() : '';

    // 解析字段
    const lines = modelContent.split('\n');
    lines.forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith('//')) {
        const [codePart, ...commentParts] = line.split('//');
        const comment = commentParts.join('//').trim();
        const parts = codePart.trim().split(/\s+/);
        const fieldName = parts[0];
        let fieldType = parts[1];
        const attributes = [];

        // 清理字段类型中的特殊字符
        if (fieldType) {
          // 移除可选标记 ? 并添加到属性中
          if (fieldType.includes('?')) {
            fieldType = fieldType.replace('?', '');
            attributes.push('O');
          }
          // 移除数组标记 []
          if (fieldType.includes('[]')) {
            fieldType = fieldType.replace('[]', '');
          }
        }

        // 处理字段属性
        if (parts.includes('@id')) attributes.push('PK');
        if (parts.includes('@unique')) attributes.push('U');
        if (parts.includes('@default')) {
          const defaultMatch = line.match(/@default\((.*?)\)/);
          if (defaultMatch) {
            // 处理默认值，确保字符串值被正确引用
            let defaultValue = defaultMatch[1];
            if (defaultValue === 'now()') {
              defaultValue = 'CURRENT_TIMESTAMP';
            }
            attributes.push(`D:${defaultValue}`);
          }
        }

        // 构建字段描述
        const attributeStr = attributes.length > 0 ? ` {${attributes.join(',')}}` : '';
        const fieldDescription = `${fieldType}${attributeStr}`;
        models[modelName].push(`${fieldName} ${fieldDescription}`);

        // 修改关系解析逻辑
        if (line.includes('@relation')) {
          const relationMatch = line.match(/references: \[(\w+)\]/);
          if (fieldType) {
            const targetModel = fieldType.replace('?', '').replace('[]', '');
            const isArray = line.includes('[]');
            const relationType = isArray ? '1:*' : '1:1';
            relations.push({
              from: modelName,
              to: targetModel,
              type: relationType,
              field: fieldName,
            });
          }
        }
      }
    });
  }

  // 生成 Mermaid 图表代码
  let mermaidCode = 'erDiagram\n\n';

  // 添加实体
  Object.entries(models).forEach(([modelName, fields]) => {
    if (modelComments[modelName]) {
      mermaidCode += `  %% ${modelName}: ${modelComments[modelName]}\n`;
    }
    mermaidCode += `  ${modelName} {\n`;
    fields.forEach((field) => {
      mermaidCode += `    ${field}\n`;
    });
    mermaidCode += '  }\n\n';
  });

  // 添加关系
  if (relations.length > 0) {
    mermaidCode += '  %% Relationships\n';
    relations.forEach(({ from, to, type, field }) => {
      const relationSymbol = type === '1:*' ? '||--o{' : '||--||';
      mermaidCode += `  ${from} ${relationSymbol} ${to} : "${field}"\n`;
    });
    mermaidCode += '\n';
  }

  // 添加枚举
  if (Object.keys(enums).length > 0) {
    mermaidCode += '  %% Enums\n';
    Object.entries(enums).forEach(([enumName, values]) => {
      mermaidCode += `  ${enumName} {\n`;
      values.forEach((value) => {
        mermaidCode += `    ${value}\n`;
      });
      mermaidCode += '  }\n\n';
    });
  }

  // 生成文档
  const content = `# Entity Relationship Diagram

This ERD is automatically generated from the Prisma schema.

\`\`\`mermaid
${mermaidCode}
\`\`\`

## Legend

### Field Attributes
- PK: Primary Key
- U: Unique
- O: Optional (Nullable)
- D: Default Value

### Relationships
- ||--||: One-to-One
- ||--o{: One-to-Many

### Notes
- Model comments are shown as %% comments
- Enum types are shown as separate entities
`;

  // 保存文件
  const outputPath = path.join(process.cwd(), 'docs', 'erd.md');
  console.log('Trying to save file to:', outputPath);

  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content);
    console.log('File saved successfully');
    console.log('File contents:');
    console.log(content);
  } catch (error) {
    console.error('Error saving file:', error);
  }
}
generateERD();
