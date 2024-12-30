import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 处理模型内容，提取字段和属性
const processModelContent = (modelContent) => {
  const fields = [];
  const lines = modelContent.split('\n');

  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('//')) return;

    // 处理复合唯一约束
    if (line.startsWith('@@unique')) return;

    // 处理普通字段
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
        let defaultValue = defaultMatch[1];
        if (defaultValue === 'now()') {
          defaultValue = 'CURRENT_TIMESTAMP';
        }
        attributes.push(`D:${defaultValue}`);
      }
    }

    // 构建字段描述
    const attributeStr = attributes.length > 0 ? ` "${attributes.join(' ')}"` : '';
    fields.push(`${fieldName} ${fieldType}${attributeStr}`);
  });

  return fields;
};

// 解析 Prisma schema
const parsePrismaSchema = (schemaContent) => {
  const models = {};
  const modelComments = {};
  const relations = [];
  const enums = {};

  let currentBlock = null;
  let currentBlockName = null;
  let currentBlockContent = [];
  let lastComment = '';

  schemaContent.split('\n').forEach((line) => {
    line = line.trim();

    // 处理注释
    if (line.startsWith('//')) {
      lastComment = line.slice(2).trim();
      return;
    }

    // 处理模型或枚举定义的开始
    if (line.startsWith('model ') || line.startsWith('enum ')) {
      const [blockType, name] = line.split(' ');
      currentBlock = blockType;
      currentBlockName = name.split('{')[0].trim();
      currentBlockContent = [];
      if (lastComment && blockType === 'model') {
        modelComments[currentBlockName] = lastComment;
      }
      return;
    }

    // 处理块的结束
    if (line === '}' && currentBlock) {
      if (currentBlock === 'model') {
        models[currentBlockName] = processModelContent(currentBlockContent.join('\n'));
      } else if (currentBlock === 'enum') {
        enums[currentBlockName] = currentBlockContent.filter((l) => l && !l.startsWith('//')).map((l) => l.trim());
      }
      currentBlock = null;
      currentBlockName = null;
      currentBlockContent = [];
      return;
    }

    // 收集块的内容
    if (currentBlock && line) {
      currentBlockContent.push(line);

      // 处理关系
      if (currentBlock === 'model' && line.includes('@relation')) {
        const fieldName = line.split(' ')[0];
        const fieldType = line.split(' ')[1];
        relations.push({
          from: currentBlockName,
          to: fieldType,
          type: line.includes('[]') ? '1:*' : '1:1',
          field: fieldName,
        });
      }
    }
  });

  return { models, modelComments, relations, enums };
};

// 生成 Mermaid 代码
const generateMermaidCode = (models, modelComments, relations, enums) => {
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
      mermaidCode += `    type ENUM "${values.join('|')}"\n`;
      mermaidCode += '  }\n\n';
    });
  }

  return mermaidCode;
};

// 生成 ERD 文档
const generateERDDoc = (mermaidCode) => {
  return `# Entity Relationship Diagram

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
};

// 主函数
async function generateERD() {
  try {
    // 读取 Prisma schema
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // 解析 schema
    const { models, modelComments, relations, enums } = parsePrismaSchema(schemaContent);

    // 生成 Mermaid 代码
    const mermaidCode = generateMermaidCode(models, modelComments, relations, enums);

    // 生成完整的 ERD 文档
    const erdDoc = generateERDDoc(mermaidCode);

    // 写入文件
    const erdPath = path.join(__dirname, '..', 'docs', 'erd.md');
    fs.writeFileSync(erdPath, erdDoc);

    console.log('ERD generated successfully!');
  } catch (error) {
    console.error('Error generating ERD:', error);
  }
}

generateERD();
