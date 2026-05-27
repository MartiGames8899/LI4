markdown_content = """# Documentação e Estratégia de Prompts - Projeto CAP (LI4)

Este documento centraliza a estratégia adotada pela equipa para a documentação do uso de Inteligência Artificial (IA) no desenvolvimento do sistema para o **Clube Amigos de Polvoreira (CAP)**, no âmbito da Unidade Curricular de Laboratórios de Informática IV.

Serve como base de conhecimento (contexto) para migração para outros ambientes ou para facilitar a integração no relatório final (`main.tex`).

---

## 1. O Conceito da Estratégia

A abordagem inicial de anexar capturas de ecrã caóticas (ex: `prompt1.png`) foi substituída por uma estratégia de **Engenharia de Prompts Estruturada**. 
Como a IA foi utilizada para agilizar o levantamento de requisitos, a criação de protótipos (HTML) e a estruturação do projeto, recriámos as interações de forma profissional. A linguagem manteve um tom realista e prático (típico de um engenheiro de software a interagir com um LLM), mas as respostas foram formatadas para alinhar exatamente com a documentação já produzida pela equipa (entrevistas, protótipos, tabelas de requisitos).

---

## 2. O Template LaTeX (`tcolorbox`)

Para garantir um aspeto profissional e consistente em todo o relatório, foi criado um comando customizado (`\caixaprompt`) no preâmbulo do documento. Este comando desenha uma caixa com fundo azul claro (`#F0F8FF`), bordas azuis escuras e cantos arredondados.

**Código a incluir no preâmbulo (antes do `\\begin{document}`):**