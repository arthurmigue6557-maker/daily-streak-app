# 🔥 Daily Streak App

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

**Mantenha sua sequência diária!**  
_Conquiste pontos, desbloqueie conquistas e suba no ranking_

[🔗 Demo](#) | [📱 Download](#) | [📖 Documentação](#)

</div>

## 

## 📱 Sobre o Projeto

**Daily Streak App** é um aplicativo web que ajuda você a manter hábitos diários através de um sistema de gamificação. Cada dia que você faz check-in, sua sequência (streak) aumenta, você ganha pontos e desbloqueia conquistas!

### ✨ Funcionalidades

| Funcionalidade           | Descrição                                     |
| :----------------------- | :-------------------------------------------- |
| 🔥 **Sistema de Streak** | Sequência diária que aumenta a cada check-in  |
| 🏆 **Conquistas**        | Desbloqueie medalhas ao atingir metas         |
| 📊 **Ranking Global**    | Compare seus pontos com outros usuários       |
| 🌙 **Dark Mode**         | Interface com tema escuro para a noite        |
| 📤 **Compartilhamento**  | Compartilhe suas conquistas nas redes sociais |
| 🔔 **Notificações**      | Lembretes para não quebrar a sequência        |
| 📱 **PWA**               | Instale como app no seu celular               |

---

## 🎮 Como Funciona

```mermaid
graph LR
    A[Login Google] --> B[Fazer Check-in]
    B --> C{Ganhou conquista?}
    C -->|Sim| D[+ Pontos Bônus]
    C -->|Não| E[+10 Pontos]
    D --> F[Atualizar Ranking]
    E --> F
    F --> G[Voltar amanhã]
```
