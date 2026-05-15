const fs = require('fs');
const path = require('path');

// Diretórios que vamos limpar
const DIRS_TO_CLEAN = [
  path.join(__dirname, 'backend'),
  path.join(__dirname, 'frontend', 'src')
];

// Extensões de arquivos permitidas
const EXTENSIONS = ['.js', '.jsx', '.css', '.sql'];

function stripComments(content, ext) {
  if (ext === '.sql') {
    // Remove -- comentários em SQL
    return content.replace(/--.*$/gm, '');
  } else if (ext === '.css') {
    // Remove /* comentários */ em CSS
    return content.replace(/\/\*[\s\S]*?\*\//g, '');
  } else {
    // Remove // e /* */ em JS/JSX, ignorando URLs http:// e https://
    return content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  }
}

function cleanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignora node_modules
      if (file !== 'node_modules' && file !== 'build') {
        cleanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (EXTENSIONS.includes(ext)) {
        try {
          const originalContent = fs.readFileSync(fullPath, 'utf8');
          const cleanContent = stripComments(originalContent, ext);
          
          // Remove linhas vazias duplas que podem sobrar
          const finalContent = cleanContent.replace(/^\s*[\r\n]/gm, '\n').replace(/\n{3,}/g, '\n\n');

          if (originalContent !== finalContent) {
            fs.writeFileSync(fullPath, finalContent, 'utf8');
            console.log(`Limpo: ${fullPath}`);
          }
        } catch (e) {
          console.error(`Erro ao processar ${fullPath}:`, e);
        }
      }
    }
  }
}

console.log('🧹 Iniciando limpeza de comentários no sistema...');
DIRS_TO_CLEAN.forEach(dir => {
  if (fs.existsSync(dir)) {
    cleanDirectory(dir);
  }
});
console.log('✅ Todos os comentários foram removidos com sucesso!');
