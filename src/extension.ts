import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const tendaCommands = [
    // Palavras-chave básicas
    { label: 'seja', documentation: 'Declara uma variável ou função.' },
    { label: 'exiba', documentation: 'Exibe um valor no console.' },
    { label: 'função', documentation: 'Define uma função anônima.' },
    { label: 'faça', documentation: 'Inicia um bloco de código.' },
    { label: 'fim', documentation: 'Finaliza um bloco de código.' },
    { label: 'retorna', documentation: 'Retorna um valor de uma função.' },
    
    // Estruturas de controle
    { label: 'se', documentation: 'Estrutura condicional.' },
    { label: 'então', documentation: 'Usado com "se" para iniciar o bloco condicional.' },
    { label: 'senão', documentation: 'Alternativa em estruturas condicionais.' },
    
    // Laços
    { label: 'para', documentation: 'Estrutura de repetição.' },
    { label: 'cada', documentation: 'Usado com "para" em iterações.' },
    { label: 'em', documentation: 'Usado em iterações para especificar o conjunto.' },
    { label: 'enquanto', documentation: 'Laço de repetição condicional.' },
    { label: 'até', documentation: 'Usado para definir intervalos.' },
    { label: 'continua', documentation: 'Pula para a próxima iteração do laço.' },
    { label: 'pare', documentation: 'Encerra um laço de repetição.' },
    
    // Operadores lógicos
    { label: 'e', documentation: 'Operador lógico AND.' },
    { label: 'ou', documentation: 'Operador lógico OR.' },
    { label: 'não', documentation: 'Operador lógico NOT.' },
    { label: 'tem', documentation: 'Verifica se uma chave existe em um dicionário ou item em lista.' },
    { label: 'não tem', documentation: 'Verifica se uma chave NÃO existe em um dicionário ou item em lista.' },
    { label: 'é', documentation: 'Operador de comparação de igualdade.' },
    { label: 'não é', documentation: 'Operador de comparação de diferença.' },
    
    // Valores especiais
    { label: 'verdadeiro', documentation: 'Valor lógico verdadeiro.' },
    { label: 'falso', documentation: 'Valor lógico falso.' },
    { label: 'Nada', documentation: 'Representa ausência de valor.' },
    { label: 'infinito', documentation: 'Valor matemático infinito.' },
    { label: 'NaN', documentation: 'Not a Number - valor matemático inválido.' },
    
    // Tipos e módulos
    { label: 'Data', documentation: 'Módulo para trabalhar com datas.' },
    { label: 'Lista', documentation: 'Módulo para manipulação de listas.' },
    { label: 'Texto', documentation: 'Módulo para manipulação de texto.' },
    { label: 'Matemática', documentation: 'Módulo com funções matemáticas.' },
    { label: 'Arquivo', documentation: 'Módulo para operações com arquivos.' },
    { label: 'Programa', documentation: 'Módulo com funções do programa.' },
    { label: 'Saída', documentation: 'Módulo para operações de saída.' },
    
    // Funções de entrada/saída
    { label: 'entrada', documentation: 'Lê uma linha da entrada padrão.' },
    { label: 'leia', documentation: 'Mostra uma mensagem e lê a entrada do usuário.' },
    
    // Palavras-chave de tratamento de erro
    { label: 'valor', documentation: 'Chave usada em retornos de sucesso.' },
    { label: 'erro', documentation: 'Chave usada em retornos de erro.' }
  ];

  // Autocomplete
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'tenda',
      {
        provideCompletionItems() {
          return tendaCommands.map(cmd => {
            const item = new vscode.CompletionItem(cmd.label, vscode.CompletionItemKind.Keyword);
            item.documentation = new vscode.MarkdownString(cmd.documentation);
            return item;
          });
        }
      }
    )
  );

  // Hover
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('tenda', {
      provideHover(document: vscode.TextDocument, position: vscode.Position) {
        // Tenta pegar a palavra na posição atual com diferentes padrões
        let wordRange = document.getWordRangeAtPosition(position);
        let word = wordRange ? document.getText(wordRange) : '';
        
        // Se não encontrou palavra, tenta expandir o range
        if (!word) {
          const line = document.lineAt(position);
          const text = line.text;
          const charIndex = position.character;
          
          // Procura por uma palavra ao redor da posição
          let start = charIndex;
          let end = charIndex;
          
          while (start > 0 && /[a-zA-ZÀ-ÿç]/.test(text[start - 1])) {
            start--;
          }
          while (end < text.length && /[a-zA-ZÀ-ÿç]/.test(text[end])) {
            end++;
          }
          
          if (start < end) {
            word = text.substring(start, end);
            wordRange = new vscode.Range(position.line, start, position.line, end);
          }
        }

        console.log(`Hover debug - Palavra detectada: "${word}"`);
        
        const cmd = tendaCommands.find(c => c.label === word);
        if (cmd) {
          console.log(`Hover debug - Comando encontrado: ${cmd.label}`);
          return new vscode.Hover(
            new vscode.MarkdownString(`**${cmd.label}**: ${cmd.documentation}`), 
            wordRange
          );
        }
        
        console.log(`Hover debug - Nenhum comando encontrado para: "${word}"`);
        return undefined;
      }
    })
  );

  // Formatter
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('tenda', {
      provideDocumentFormattingEdits(document) {
        const edits: vscode.TextEdit[] = [];

        let indentLevel = 0;
        const headerRegex = /^seja\b.*\)\s*=\s*$/;
        const combinedHeaderOpener = /^seja\b.*\)\s*=\s*faça\b.*$/;
        const openerRegex = /\b(faça|então)\b/;

        const withIndent = (txt: string, lvl = indentLevel) =>
          '  '.repeat(lvl) + txt;

        const maybeResetLeak = (nextTrimmed: string) => {
          if (
            indentLevel === 1 &&
            nextTrimmed.length > 0 &&
            !openerRegex.test(nextTrimmed) &&
            nextTrimmed !== 'fim'
          ) {
            indentLevel = 0;
          }
        };

        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const trimmed = line.text.trim();

          // Linha vazia
          if (trimmed === '') {
            edits.push(vscode.TextEdit.replace(line.range, ''));
            continue;
          }

          // Antes de formatar, verifica e corrige possível vazamento
          maybeResetLeak(trimmed);

          // 1. Cabeço + abre bloco na mesma linha: "seja foo() = faça"
          if (combinedHeaderOpener.test(trimmed)) {
            // Divide em duas linhas: cabeçalho + "faça" indentado
            const headerPart = trimmed.replace(/\s*faça\b.*$/, '').trimEnd();

            const headerLine = withIndent(headerPart);
            const openerLine = withIndent('faça', indentLevel + 1);

            edits.push(
              vscode.TextEdit.replace(
                line.range,
                `${headerLine}\n${openerLine}`
              )
            );

            // +2 níveis (cabeçalho + bloco)
            indentLevel += 2;

            continue;
          }

          // 2. Fechador: "fim"
          if (trimmed === 'fim') {
            indentLevel = Math.max(0, indentLevel - 1);
            edits.push(
              vscode.TextEdit.replace(line.range, withIndent(trimmed))
            );
            continue;
          }

          // 3. Cabeçalho isolado: "seja foo() ="
          if (headerRegex.test(trimmed)) {
            edits.push(
              vscode.TextEdit.replace(line.range, withIndent(trimmed))
            );
            indentLevel++; // virtual level
            continue;
          }

          // 4. Abre bloco: "faça" ou "então"
          if (openerRegex.test(trimmed)) {
            edits.push(
              vscode.TextEdit.replace(line.range, withIndent(trimmed))
            );
            indentLevel++;
            continue;
          }

          // 5. Linha comum de código
          const desired = withIndent(trimmed);
          if (desired !== line.text) {
            edits.push(vscode.TextEdit.replace(line.range, desired));
          }
        }

        return edits;
      },
    })
  );

  // Comando para mostrar instruções de instalação
  context.subscriptions.push(
    vscode.commands.registerCommand('tenda.showInstallInstructions', () => {
      const panel = vscode.window.createWebviewPanel(
        'tendaInstall',
        'Como Instalar Tenda',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getInstallInstructionsHtml();
    })
  );

  // Comando para abrir documentação oficial
  context.subscriptions.push(
    vscode.commands.registerCommand('tenda.openDocumentation', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://tenda.dev/docs'));
    })
  );

  // Comando para abrir playground
  context.subscriptions.push(
    vscode.commands.registerCommand('tenda.openPlayground', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://tenda.dev/playground'));
    })
  );

  // Comando para executar arquivo Tenda (se o runtime estiver instalado)
  context.subscriptions.push(
    vscode.commands.registerCommand('tenda.runFile', async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage('Nenhum arquivo Tenda aberto');
        return;
      }

      if (activeEditor.document.languageId !== 'tenda') {
        vscode.window.showErrorMessage('O arquivo atual não é um arquivo Tenda (.tenda)');
        return;
      }

      // Verificar se o interpretador Tenda está instalado
      const terminal = vscode.window.createTerminal('Tenda');
      const filePath = activeEditor.document.fileName;
      
      // Tentar executar com 'tenda' command
      terminal.sendText(`tenda "${filePath}"`);
      terminal.show();
    })
  );
}

export function deactivate() {}

function getInstallInstructionsHtml(): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Como Instalar a Linguagem Tenda</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--vscode-textLink-foreground);
            padding-bottom: 20px;
        }
        .step {
            margin: 25px 0;
            padding: 20px;
            border-left: 4px solid var(--vscode-textLink-foreground);
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 8px;
        }
        .step h2 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
        }
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 14px;
        }
        .code-block {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            overflow-x: auto;
            border: 1px solid var(--vscode-textSeparator-foreground);
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            text-decoration: none;
            border-radius: 6px;
            margin: 8px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .warning {
            background-color: var(--vscode-inputValidation-warningBackground);
            border-left: 4px solid var(--vscode-inputValidation-warningBorder);
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
        }
        .success {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-editor-background);
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
        }
        .platform-tabs {
            display: flex;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid var(--vscode-textSeparator-foreground);
        }
        .platform-tab {
            padding: 10px 20px;
            margin-right: 5px;
            background-color: var(--vscode-tab-inactiveBackground);
            border: none;
            cursor: pointer;
            border-radius: 6px 6px 0 0;
        }
        .platform-tab.active {
            background-color: var(--vscode-tab-activeBackground);
            color: var(--vscode-tab-activeForeground);
        }
        .platform-content {
            display: none;
            padding: 20px 0;
        }
        .platform-content.active {
            display: block;
        }
        .emoji {
            font-size: 1.2em;
            margin-right: 8px;
        }
        .checklist {
            list-style: none;
            padding: 0;
        }
        .checklist li {
            padding: 8px 0;
            position: relative;
            padding-left: 30px;
        }
        .checklist li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Guia de Instalação da Linguagem Tenda</h1>
            <p>Passo a passo completo para instalar e usar a linguagem Tenda</p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Status Atual:</strong> A linguagem Tenda ainda está em desenvolvimento ativo. 
            Este guia será atualizado conforme novas versões forem lançadas.
        </div>

        <div class="step">
            <h2><span class="emoji">📖</span>Passo 1: Verifique a Documentação Oficial</h2>
            <p>Sempre consulte a documentação mais recente para informações atualizadas:</p>
            <div class="code-block">
                <a href="https://tenda.dev/docs" class="button">📚 Documentação Oficial</a>
                <a href="https://tenda.dev/docs/comecando/guia-rapido" class="button">⚡ Guia Rápido</a>
            </div>
        </div>

        <div class="step">
            <h2><span class="emoji">🎮</span>Passo 2: Experimente Online (Recomendado)</h2>
            <p>Enquanto prepara a instalação local, você pode começar a programar imediatamente:</p>
            <div class="code-block">
                <a href="https://tenda.dev/playground" class="button">🌐 Playground Online</a>
            </div>
            <p><strong>Vantagens do Playground:</strong></p>
            <ul class="checklist">
                <li>Não precisa instalar nada</li>
                <li>Funciona em qualquer navegador</li>
                <li>Exemplos prontos para testar</li>
                <li>Sempre atualizado com a versão mais recente</li>
            </ul>
        </div>

        <div class="step">
            <h2><span class="emoji">💻</span>Passo 3: Instalação Local</h2>
            
            <div class="platform-tabs">
                <button class="platform-tab active" onclick="showPlatform('linux')">🐧 Linux/Ubuntu</button>
                <button class="platform-tab" onclick="showPlatform('windows')">🪟 Windows</button>
                <button class="platform-tab" onclick="showPlatform('mac')">🍎 macOS</button>
                <button class="platform-tab" onclick="showPlatform('source')">⚙️ Código Fonte</button>
            </div>

            <div id="linux" class="platform-content active">
                <h3>Linux/Ubuntu</h3>
                <div class="code-block">
                    <code># Opção 1: Via package manager (quando disponível)</code><br>
                    <code>curl -fsSL https://tenda.dev/install.sh | bash</code><br><br>
                    
                    <code># Opção 2: Download direto</code><br>
                    <code>wget https://github.com/tenda-lang/tenda/releases/latest/download/tenda-linux-x64.tar.gz</code><br>
                    <code>tar -xzf tenda-linux-x64.tar.gz</code><br>
                    <code>sudo mv tenda /usr/local/bin/</code>
                </div>
            </div>

            <div id="windows" class="platform-content">
                <h3>Windows</h3>
                <div class="code-block">
                    <code># Via Chocolatey (quando disponível)</code><br>
                    <code>choco install tenda</code><br><br>
                    
                    <code># Via Scoop</code><br>
                    <code>scoop install tenda</code><br><br>
                    
                    <code># Download manual</code><br>
                    <p>1. Baixe: <a href="https://github.com/tenda-lang/tenda/releases">tenda-windows-x64.exe</a></p>
                    <p>2. Adicione ao PATH do sistema</p>
                </div>
            </div>

            <div id="mac" class="platform-content">
                <h3>macOS</h3>
                <div class="code-block">
                    <code># Via Homebrew (quando disponível)</code><br>
                    <code>brew install tenda</code><br><br>
                    
                    <code># Download manual</code><br>
                    <code>curl -L https://github.com/tenda-lang/tenda/releases/latest/download/tenda-macos-x64.tar.gz | tar -xz</code><br>
                    <code>sudo mv tenda /usr/local/bin/</code>
                </div>
            </div>

            <div id="source" class="platform-content">
                <h3>Compilar do Código Fonte</h3>
                <div class="code-block">
                    <code># Clone o repositório</code><br>
                    <code>git clone https://github.com/tenda-lang/tenda.git</code><br>
                    <code>cd tenda</code><br><br>
                    
                    <code># Compile e instale</code><br>
                    <code>make build</code><br>
                    <code>sudo make install</code>
                </div>
            </div>
        </div>

        <div class="step">
            <h2><span class="emoji">✅</span>Passo 4: Verificar Instalação</h2>
            <p>Teste se a instalação funcionou corretamente:</p>
            <div class="code-block">
                <code>tenda --version</code><br><br>
                <code># Deve mostrar algo como:</code><br>
                <code>Tenda 0.1.0</code>
            </div>
        </div>

        <div class="step">
            <h2><span class="emoji">🏃‍♂️</span>Passo 5: Primeiro Programa</h2>
            <p>Crie seu primeiro programa em Tenda:</p>
            
            <p><strong>1. Crie um arquivo chamado <code>ola.tenda</code>:</strong></p>
            <div class="code-block">
                <code>seja nome = leia("Digite seu nome: ")</code><br>
                <code>exiba("Olá, " + nome + "!")</code><br>
                <code>exiba("Bem-vindo à linguagem Tenda! 🎉")</code>
            </div>
            
            <p><strong>2. Execute o programa:</strong></p>
            <div class="code-block">
                <code>tenda ola.tenda</code>
            </div>
            
            <p><strong>3. No VS Code, você pode:</strong></p>
            <ul class="checklist">
                <li>Clicar no botão ▶️ "Executar Arquivo Tenda"</li>
                <li>Usar Ctrl+Shift+P → "Tenda: Executar Arquivo Tenda"</li>
                <li>Botão direito → "Executar Arquivo Tenda"</li>
            </ul>
        </div>

        <div class="step">
            <h2><span class="emoji">🛠️</span>Passo 6: Configurar seu Ambiente</h2>
            <p><strong>Para desenvolvimento produtivo:</strong></p>
            <ul class="checklist">
                <li>✅ Extensão VS Code instalada (você já tem!)</li>
                <li>Configure seu editor de texto favorito</li>
                <li>Adicione Tenda ao PATH do sistema</li>
                <li>Configure alias úteis no terminal</li>
            </ul>
            
            <p><strong>Alias úteis para o terminal:</strong></p>
            <div class="code-block">
                <code># Adicione ao seu .bashrc ou .zshrc</code><br>
                <code>alias tr="tenda run"</code><br>
                <code>alias tv="tenda --version"</code><br>
                <code>alias th="tenda --help"</code>
            </div>
        </div>

        <div class="step">
            <h2><span class="emoji">🔗</span>Recursos Úteis</h2>
            <div class="code-block">
                <a href="https://tenda.dev" class="button">🏠 Site Oficial</a>
                <a href="https://tenda.dev/docs" class="button">📚 Documentação</a>
                <a href="https://tenda.dev/playground" class="button">🎮 Playground</a>
                <a href="https://tenda.dev/docs/para-programadores/ola-mundo" class="button">👋 Primeiro Programa</a>
            </div>
            
            <p><strong>Comunidade:</strong></p>
            <ul>
                <li>🐙 <a href="https://github.com/tenda-lang/tenda">GitHub Oficial</a></li>
                <li>💬 Discord da Comunidade</li>
                <li>📺 Tutoriais no YouTube</li>
                <li>📝 Blog com exemplos</li>
            </ul>
        </div>

        <div class="success">
            <strong>🎉 Parabéns!</strong> Agora você está pronto para programar em Tenda! 
            A extensão VS Code que você instalou te ajudará com syntax highlighting, 
            autocompletar e execução de código.
        </div>
    </div>

    <script>
        function showPlatform(platform) {
            // Remove active class from all tabs
            document.querySelectorAll('.platform-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all content
            document.querySelectorAll('.platform-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked tab
            event.target.classList.add('active');
            
            // Show corresponding content
            document.getElementById(platform).classList.add('active');
        }
    </script>
</body>
</html>
  `;
}
