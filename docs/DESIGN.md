# Tangram Design System — contrato do protótipo

Fonte: Tangram RD Station (`design.md` do template de setup piloto IA).  
Documentação oficial: https://tangram.rdstation.com.br

Este protótipo **obrigatoriamente** usa os tokens e o shell abaixo. Não inventar paleta, tipografia ou chrome paralelo.

## Shell

Árvore fixa: `.layout` → `nav.navbar` → `aside.sidebar` → `main.content`.  
Conteúdo da wave 3 vive só em `main.content`.

## Tokens de cor

| Token | Hex |
|---|---|
| `--primary-border` | `#00DBFF` |
| `--primary-icon` / `--primary-text` | `#0077B2` |
| `--primary-icon-hover` / `--primary-text-hover` | `#005580` |
| `--primary-icon-on-color` / `--primary-text-on-color` | `#00DBFF` |
| `--primary-icon-on-color-hover` / `--primary-text-on-color-hover` | `#66E9FF` |
| `--primary-surface-high-emphasis` | `#00DBFF` |
| `--primary-surface-low-emphasis` | `#B2F4FF` |
| `--primary-surface-hover` | `#66EBFF` |
| `--neutral-border` | `#D6DBDE` |
| `--neutral-border-interactive` | `#B2BCC1` |
| `--neutral-border-interactive-hover` | `#8C9BA3` |
| `--neutral-border-interactive-disabled` | `#E5E8EA` |
| `--neutral-icon-high-emphasis` / `--neutral-text-high-emphasis` | `#002233` |
| `--neutral-icon-low-emphasis` | `#596B7A` |
| `--neutral-text-low-emphasis` | `#405466` |
| `--neutral-icon-disabled` / `--neutral-text-disabled` | `#8C98A3` / `#7F8D99` |
| `--neutral-icon-inverse` / `--neutral-text-inverse` | `#FFFFFF` |
| `--neutral-surface` | `#FFFFFF` |
| `--neutral-surface-high-emphasis` | `#E5E8EA` |
| `--neutral-surface-low-emphasis` | `#ECEEEF` |
| `--neutral-surface-hover` | `#DADEE0` |
| `--neutral-surface-disabled` | `#EDEFF1` |
| `--neutral-surface-inverse` | `#002233` |
| `--danger-text` / `--danger-icon` / `--danger-border` | `#C20046` |
| `--danger-surface-high-emphasis` | `#E60F57` |
| `--success-icon` / `--success-text` | `#087A3A` |
| `--success-surface-high-emphasis` | `#0ED869` |

## Tipografia

Família: **DM Sans**. Pesos 500 / 700 / 800.

| Token | Size | Line-height | Letter-spacing |
|---|---|---|---|
| `--text-xl` | 28px | 36px | -0.01em |
| `--text-lg` | 20px | 30px | -0.01em |
| `--text-md` | 16px | 24px | -0.01em |
| `--text-sm` | 14px | 20px | -0.01em |
| `--text-xs` | 12px | 16px | 0 |

## Espaçamento (grid 8px)

`--size-spacing-01` 4px · `02` 8px · `03` 12px · `04` 16px · `05` 24px · `06` 32px · `07` 40px

## Radius / sombra / z-index

- Radius: `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `pill` 999px
- `--shadow-md`: `0 8px 18px rgba(0,34,51,0.16)` (drawer)
- `--shadow-xl`: overlay/modal
- Drawer `z-index`: `--zindex-4` 1030 · overlay `--zindex-3` 1020

## Componentes usados nesta wave

- **Button** kinds: primary (navy inverse + texto on-color), secondary (cyan low-emphasis), tertiary, icon-only. Altura 40px, radius md, um primary por superfície.
- **Input** 40px, border interactive, radius md.
- **Switch**, **Message** (info), **Drawer** lg 600px âncora direita.
- Ícones: Material Symbols Rounded, fill true, weight 600. Tamanhos 16 / 20 / 24.

## Regras de produto (wave 3)

- Nome do link pré-preenchido com o nome da negociação.
- Primary **Criar link** só habilita com obrigatórios preenchidos.
- Sem itens: valor manual; item genérico enviado = descrição (ou `Pedido #`).
- Com itens: valor = soma; nome, preço unitário e quantidade obrigatórios.
- Link publicado é congelado (sem edição). Copiar URL. Nova cobrança = novo link.
