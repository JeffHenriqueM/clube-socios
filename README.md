# Clube de Sócios

Plataforma web de **acessos por nível + indicação + parceiros da região**.

Sócios do resort recebem um acesso (**Bronze, Prata, Ouro, Integral**) que dá desconto nos
parceiros cadastrados. Cada sócio pode **indicar pessoas**, que ao serem aprovadas ganham um
acesso de **Cliente**. Empresas parceiras cadastram seus próprios **serviços e preços** e recebem
**avaliações** de sócios e clientes. Passeios da região são um tipo de serviço — então entram no
mesmo catálogo, com o mesmo desconto e a mesma avaliação.

> O clube é **apenas intermediário**: não processa reserva nem pagamento. Preço, negociação e
> cobrança acontecem direto entre a pessoa e o parceiro.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5180.

Acessos de teste (senha `123456`, botões de atalho na tela de login):

| Papel | E-mail |
| --- | --- |
| Admin | admin@clube.com |
| Sócio Ouro | marina@exemplo.com |
| Sócio Bronze | rafael@exemplo.com |
| Cliente | camila@exemplo.com |
| Parceiro | contato@maraberto.com |

## O que cada papel faz

- **Admin** — cadastra sócios e define nível; cadastra empresas parceiras (e o login delas);
  cadastra/edita serviços e passeios de qualquer parceiro; aprova ou recusa indicações.
- **Sócio** — vê seu nível e desconto, navega parceiros e passeios com o preço já com desconto,
  avalia, indica pessoas e acompanha o status das indicações.
- **Cliente** — mesmo acesso de navegação e avaliação, com o desconto do nível Cliente.
- **Parceiro (empresa)** — edita os dados da empresa, publica/edita seus serviços e preços,
  define desconto por nível e lê as avaliações recebidas.

## Níveis e desconto

Cada nível tem um **desconto padrão** (`src/types.ts` → `NIVEIS`): Cliente 5%, Bronze 10%,
Prata 15%, Ouro 20%, Integral 30%. Cada serviço pode **sobrescrever** o desconto de qualquer
nível (campo em branco = usa o padrão). O preço exibido para a pessoa logada já sai calculado.

## Estrutura

```
src/
  types.ts              domínio (níveis, usuários, empresas, serviços, avaliações, indicações)
  data/store.ts         camada de dados (única parte que toca persistência)
  data/seed.ts          dados de exemplo
  lib/auth.tsx          sessão e login
  components/           layout, UI compartilhada, editor de serviços
  pages/                telas por papel
```

## Persistência — estado atual e migração

Hoje os dados vivem em **localStorage do navegador** (protótipo interno, sem backend). Toda a
persistência está isolada em `src/data/store.ts`: as telas só usam `useBanco()` e as funções
`inserir` / `atualizar` / `remover`.

Para subir ao Firebase, reescreve-se **só esse arquivo**: o cache passa a ser alimentado por
`onSnapshot` (mesma forma de assinatura que o `useSyncExternalStore` já espera) e as mutações
viram `setDoc` / `updateDoc` / `deleteDoc`. Nenhuma tela precisa mudar.

Pendências conhecidas para a versão com backend:

- **Senha em texto puro** em `Usuario.senha` — existe só para o protótipo rodar sem servidor.
  Vira Firebase Auth (e o campo some do documento).
- Regras de segurança por papel: hoje as permissões são só de interface (rotas por papel).
- Upload de fotos de empresas e serviços.
