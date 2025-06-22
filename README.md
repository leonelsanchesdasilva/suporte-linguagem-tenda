# Extensão Tenda para VS Code

Esta extensão adiciona suporte à linguagem de programação **Tenda** no Visual Studio Code.

## Recursos

- **Destaque de sintaxe** completo para a linguagem Tenda
- **Autocompletar** para palavras-chave e construções da linguagem
- **Snippets** para estruturas comuns (condicionais, laços, funções)
- **Hover** com documentação das palavras-chave
- **Suporte a comentários** com `//`

## Sintaxe Suportada

### Palavras-chave principais:
- `seja` - Declaração de variáveis e funções
- `exiba` - Exibir valores no console
- `função` - Definir funções anônimas
- `faça` / `fim` - Blocos de código
- `retorna` - Retornar valores de funções

### Estruturas de controle:
- `se` / `então` / `senão` / `fim` - Condicionais
- `para` / `cada` / `em` / `enquanto` - Laços
- `até` - Definir intervalos
- `continua` - Pular iteração

### Operadores lógicos:
- `e`, `ou`, `não` - Operadores lógicos
- `tem`, `não tem` - Verificar existência em dicionários/listas
- `é`, `não é` - Comparação de igualdade/diferença

### Valores especiais:
- `verdadeiro`, `falso` - Valores lógicos
- `Nada` - Ausência de valor
- `infinito`, `NaN` - Valores matemáticos especiais

### Módulos do Prelúdio:
- `Data` - Manipulação de datas
- `Lista` - Operações com listas
- `Texto` - Manipulação de texto
- `Matemática` - Funções matemáticas
- `Arquivo` - Operações com arquivos
- `Programa` - Funções do programa
- `Saída` - Operações de saída

### Funções de entrada:
- `entrada()` - Lê entrada padrão
- `leia(mensagem)` - Lê entrada com prompt

## Tipos de dados suportados:
- **Números**: `42`, `3.14`, `0xDead_Beef`, `0b1010`, `0o755`
- **Operadores**: `+`, `-`, `*`, `/`, `%`, `^` (exponenciação)
- **Texto**: `"Olá, mundo!"`
- **Listas**: `[1, 2, 3, 4, 5]`
- **Dicionários**: `{ "nome": "Tenda", "versão": 1.0 }`
- **Intervalos**: `1 até 10`
- **Funções**: `seja soma(a, b) = a + b`

## Exemplos de uso

### Variáveis:
```tenda
seja nome = "Tenda"
seja idade = 10
seja lista = [1, 2, 3, 4, 5]
```

### Função simples:
```tenda
seja soma(a, b) = a + b
seja resultado = soma(10, 5)
exiba("A soma é: " + resultado)
```

### Estrutura condicional:
```tenda
seja idade = 18

se idade >= 18 então
  exiba("Você é maior de idade.")
senão
  exiba("Você é menor de idade.")
fim
```

### Laço de repetição:
```tenda
para cada i em 1 até 5 faça
  exiba("Número: " + i)
fim
```

### Entrada de dados:
```tenda
seja nome = leia("Digite seu nome: ")
seja idade = entrada()
exiba("Olá, " + nome + "! Você tem " + idade + " anos.")
```

### Operações matemáticas:
```tenda
seja resultado = 2 ^ 3  # Exponenciação
seja resto = 10 % 3     # Resto da divisão
seja raiz = Matemática.raiz_quadrada(16)
exiba("2³ = " + resultado + ", 10 % 3 = " + resto + ", √16 = " + raiz)
```

### Tratamento de erro:
```tenda
seja conversao = Texto.para_número("abc")
se conversao tem "erro" então
  exiba("Erro: " + conversao.erro)
senão
  exiba("Número: " + conversao.valor)
fim
```

### Operações com listas:
```tenda
seja lista = [1, 2, 3]
Lista.insira(lista, 4)
seja tamanho = Lista.tamanho(lista)

se lista tem 2 então
  exiba("A lista contém o número 2")
fim
```

## Instalação

1. Abra o VS Code
2. Vá para a aba Extensions (Ctrl+Shift+X)
3. Procure por "Tenda"
4. Clique em Install

## Desenvolvimento

Para contribuir com esta extensão:

1. Clone o repositório
2. Execute `npm install` para instalar dependências
3. Execute `npm run compile` para compilar o TypeScript
4. Pressione F5 para abrir uma nova janela do VS Code com a extensão carregada

## Recursos Adicionais

- [Documentação oficial da linguagem Tenda](https://tenda.dev/docs)
- [Playground online](https://tenda.dev/playground)

## Licença

Esta extensão é distribuída sob a licença MIT.