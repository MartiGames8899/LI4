#!/usr/bin/env python3
"""
Patch cap4: inserts all missing content into 04_especificacao_modelacao.tex
Run from the Relatorio directory: py patch_cap4.py
"""
import re

filepath = r'chapters/04_especificacao_modelacao.tex'
with open(filepath, 'r', encoding='utf-8') as f:
    tex = f.read()

# ============================================================
# HELPER
# ============================================================
def insert_after(tex, anchor, content):
    idx = tex.find(anchor)
    if idx == -1:
        raise ValueError(f'Anchor not found: {anchor[:60]!r}')
    pos = idx + len(anchor)
    return tex[:pos] + content + tex[pos:]

def replace_block(tex, old, new):
    if old not in tex:
        raise ValueError(f'Block not found: {old[:60]!r}')
    return tex.replace(old, new, 1)

# ============================================================
# 1. DEPLOYMENT DIAGRAM — add after Diagrama de Componentes subsection
# ============================================================
deploy_content = r"""

\subsection{Diagrama de Implantação}

O \textbf{diagrama de implantação} representa a distribuição física dos artefactos do sistema pelos nós de hardware e serviços externos com que interage. Este artefacto é fundamental para validar a coerência entre as decisões arquiteturais tomadas na secção \ref{sec:decisoes_arq} e a infraestrutura necessária para as suportar.

\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth,height=0.85\textheight,keepaspectratio]{diagrama_deployment.png}
    \caption{Diagrama de implantação do sistema CAP.}
    \label{fig:diagrama-deployment}
\end{figure}

Do diagrama identificam-se quatro camadas de nós. Na \textbf{Camada Cliente}, os utilizadores acedem ao sistema através de um browser web (SPA React) ou da aplicação móvel (React Native), comunicando via HTTPS. Na \textbf{Camada de Servidor de Aplicação}, o API Gateway (ASP.NET Core 8) centraliza o roteamento e a autenticação JWT, delegando o processamento nos módulos do Monólito Modular. Os \textit{BackgroundServices} do .NET 8 gerem os \textit{cronjobs} de notificações e de geração de SAF-T de forma assíncrona. Na \textbf{Camada de Dados}, o PostgreSQL é acedido exclusivamente pelo servidor aplicacional via Entity Framework Core na porta TCP 5432. Na camada de \textbf{Serviços Externos}, o Gateway de Pagamentos (Easypay/Stripe) comunica com o servidor de duas formas: o módulo financeiro invoca a API REST para criar pedidos, e o gateway devolve confirmações assíncronas via \textit{webhook} HMAC para o API Gateway. O serviço de email/SMS (SendGrid/Twilio) é invocado unidirecionalmente pelo Serviço de Notificações.

\subsection{Matriz de Permissões RBAC}

O sistema implementa um modelo de controlo de acessos baseado em papéis (\textit{Role-Based Access Control} --- RBAC), conforme exigido pelo \textbf{RNF-03}. A tabela seguinte mapeia cada operação principal do sistema ao conjunto de papéis que tem permissão de a executar, servindo como contrato de referência para a implementação da camada de autorização no API Gateway.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\small
\begin{tabular}{|p{5.5cm}|c|c|c|c|c|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Operação}} & \textcolor{white}{\textbf{Atleta}} & \textcolor{white}{\textbf{EE}} & \textcolor{white}{\textbf{Treinador}} & \textcolor{white}{\textbf{Secretaria}} & \textcolor{white}{\textbf{Gerência}} \\ \hline
Registar-se / Iniciar sessão & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
Editar perfil próprio & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
Aprovar / rejeitar registo & --- & --- & --- & \checkmark & \checkmark \\ \hline
Gerir equipas e plantéis & --- & --- & \checkmark & --- & \checkmark \\ \hline
Agendar / cancelar treinos & --- & --- & \checkmark & --- & \checkmark \\ \hline
Registar presenças em treino & --- & --- & \checkmark & --- & --- \\ \hline
Criar / publicar convocatória & --- & --- & \checkmark & --- & --- \\ \hline
Confirmar presença (convocatória) & \checkmark & \checkmark & --- & --- & --- \\ \hline
Registar resultado de jogo & --- & --- & \checkmark & --- & \checkmark \\ \hline
Submeter atestado médico & \checkmark & \checkmark & --- & --- & --- \\ \hline
Validar atestado médico & --- & --- & --- & \checkmark & \checkmark \\ \hline
Reportar lesão / queixa & \checkmark & \checkmark & \checkmark & --- & --- \\ \hline
Consultar dados clínicos (próprios) & \checkmark & \checkmark & --- & --- & --- \\ \hline
Consultar dados clínicos (plantel) & --- & --- & \checkmark & \checkmark & \checkmark \\ \hline
Efetuar pagamento de quota & \checkmark & \checkmark & --- & --- & --- \\ \hline
Registar pagamento manual & --- & --- & --- & \checkmark & \checkmark \\ \hline
Gerar relatório SAF-T & --- & --- & --- & \checkmark & \checkmark \\ \hline
Consultar contabilidade global & --- & --- & --- & --- & \checkmark \\ \hline
Reservar instalação & --- & --- & \checkmark & \checkmark & \checkmark \\ \hline
Gerir instalações (manutenção) & --- & --- & --- & --- & \checkmark \\ \hline
Gerir modalidades e épocas & --- & --- & --- & --- & \checkmark \\ \hline
Consultar dashboards de desempenho & \checkmark & \checkmark & \checkmark & --- & \checkmark \\ \hline
Consultar logs de auditoria & --- & --- & --- & --- & \checkmark \\ \hline
\end{tabular}
\caption{Matriz de permissões RBAC: papéis versus operações principais do sistema (\checkmark = permitido, --- = negado).}
\label{tab:rbac}
\end{table}
\rowcolors{2}{white}{white}
"""

anchor_deploy = r"""A justificação para a divisão em módulos independentes prende-se com a possibilidade de os desenvolver de forma paralela e de os modificar sem necessidade de alterar o código dos restantes módulos, desde que as interfaces definidas entre eles sejam respeitadas."""

tex = insert_after(tex, anchor_deploy, deploy_content)
print('1. Deployment + RBAC inserted')

# ============================================================
# 2. STATE MACHINES — Reserva and Lesão (after Atestado SM)
# ============================================================
sm_new = r"""

O quinto diagrama formaliza o ciclo de vida de uma \textbf{Reserva de Instalação}, entidade cujos estados determinam a disponibilidade dos espaços físicos do clube (\textbf{RF-20}):

\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth,height=0.85\textheight,keepaspectratio]{maquina_estados_reserva.png}
    \caption{Diagrama de máquina de estados do ciclo de vida de uma Reserva de Instalação (RF-20).}
    \label{fig:maquina_estados_reserva}
\end{figure}

Uma reserva é criada no estado \textit{Pendente} quando o utilizador submete o pedido. O sistema executa imediatamente uma \textit{query} de interseção temporal: na ausência de conflitos, a reserva transita para \textit{Confirmada} e o slot é bloqueado no calendário; na presença de conflitos, é rejeitada com sugestão de alternativas. A partir do estado \textit{Confirmada}, a reserva pode ser cancelada voluntariamente (com libertação do slot e notificação da equipa) ou por decreto de manutenção urgente declarado pela Gerência. Quando a data e hora do evento passam, um \textit{cronjob} transita automaticamente a reserva para \textit{Concluída}.

O sexto diagrama modela o ciclo de vida de uma \textbf{Lesão}, entidade clínica que determina a disponibilidade de convocação do atleta (\textbf{RF-12}):

\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth,height=0.85\textheight,keepaspectratio]{maquina_estados_lesao.png}
    \caption{Diagrama de máquina de estados do ciclo de vida de uma Lesão (RF-12).}
    \label{fig:maquina_estados_lesao}
\end{figure}

Uma lesão é inicialmente \textit{Reportada} pelo atleta ou encarregado. O treinador ou departamento médico confirma-a, transitando para \textit{Ativa} — estado em que o método \texttt{isAtivo()} da classe \texttt{Lesao} retorna \texttt{true} e o atleta fica bloqueado em convocatórias. Com o início de tratamento formal, a lesão transita para \textit{Em Recuperação}. Em caso de alta clínica, transita para \textit{Resolvida}, liberando o atleta. Uma recaída pode repor o estado \textit{Ativa}. Uma lesão leve pode transitar diretamente de \textit{Ativa} para \textit{Resolvida} sem tratamento formal.
"""

anchor_sm = r"""Tanto no estado \textit{Rejeitado} como no \textit{Expirado}, o atleta ou encarregado pode submeter um novo documento, reiniciando o ciclo."""

tex = insert_after(tex, anchor_sm, sm_new)
print('2. Reserva + Lesão state machines inserted')

# ============================================================
# 3. UC TABLES — add to each subsystem subsubsection
# ============================================================

# ----- 3a. Gestão de Utilizadores: RF-02, RF-03, RF-04 -----
uc_utilizadores = r"""
O caso de uso \textit{Vincular Encarregado a Atleta} (Tabela~\ref{tab:uc_vincular_ee}) concretiza o \textbf{RF-02} (Gestão de Perfis Parentais), que exige que o sistema centralize sob um único perfil parental a responsabilidade legal, financeira e desportiva dos atletas menores. Esta vinculação é sujeita a validação pela Secretaria para garantir a legitimidade da associação familiar antes de qualquer delegação de permissões.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Vincular Encarregado a Atleta \\ \hline
\textbf{Requisitos associados} & RF-02, RNF-06 \\ \hline
\textbf{Ator} & Encarregado de Educação / Secretaria \\ \hline
\textbf{Descrição} & O encarregado solicita a associação formal ao perfil de um atleta menor. \\ \hline
\textbf{Pré-condição} & Ambos os perfis (EE e Atleta) existem na base de dados com estado \textit{Ativo}. \\ \hline
\textbf{Pós-condição} & O EE herda permissões de visualização dos dados do atleta e a conta corrente fica consolidada. \\ \hline
\textbf{Fluxo normal} &
1. O EE acede à área de gestão de dependentes e insere o NIF ou código único do atleta. \newline
2. O sistema verifica a existência do atleta e a ausência de vínculo duplicado. \newline
3. O sistema cria um pedido de vinculação no estado \textit{Pendente}. \newline
4. A Secretaria revê e aprova o pedido. \newline
5. O sistema ativa o vínculo e concede ao EE acesso à conta corrente e dados desportivos do atleta. \\ \hline
\textbf{Fluxo de exceção 1} &
[atleta não encontrado ou já vinculado] (passo 2) \newline
2.1. O sistema informa que o código é inválido ou a vinculação já existe. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Vincular Encarregado a Atleta''.}
\label{tab:uc_vincular_ee}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Enviar Mensagem Interna} (Tabela~\ref{tab:uc_chat}) implementa o módulo de comunicação centralizado definido pelo \textbf{RF-03} (Sistema de Comunicação Interna), que substitui os canais informais (WhatsApp, SMS) por um canal auditável e com controlo de acessos. A restrição de contactos por estrutura hierárquica é imposta pelo sistema para evitar comunicações não autorizadas.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Enviar Mensagem Interna \\ \hline
\textbf{Requisitos associados} & RF-03, RNF-01, RNF-06 \\ \hline
\textbf{Ator} & Qualquer utilizador autenticado \\ \hline
\textbf{Descrição} & O utilizador envia uma mensagem a um contacto ou grupo permitido pela hierarquia do sistema. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado e o destinatário pertence à lista de contactos autorizados. \\ \hline
\textbf{Pós-condição} & A mensagem é persistida na base de dados e o destinatário recebe uma notificação \textit{push}. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador seleciona um contacto da lista (filtrada por equipa e papel). \newline
2. O utilizador redige a mensagem e, opcionalmente, anexa um ficheiro (PDF/imagem, máx. 5 MB). \newline
3. O sistema valida o tipo e tamanho do anexo. \newline
4. O sistema armazena a mensagem com registo de auditoria (\textbf{RNF-06}). \newline
5. O sistema dispara uma notificação \textit{push} para o destinatário. \\ \hline
\textbf{Fluxo de exceção 1} &
[destinatário fora do âmbito permitido] (passo 1) \newline
1.1. O sistema não apresenta o destinatário na lista de contactos autorizados. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Enviar Mensagem Interna''.}
\label{tab:uc_chat}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Configurar Preferências de Notificação} (Tabela~\ref{tab:uc_config_notif}) é a face de configuração do motor de alertas definido pelo \textbf{RF-04} (Motor de Notificações Automáticas). Permite que cada utilizador escolha os canais e os tipos de evento para os quais pretende ser notificado, respeitando a pré-condição de que os dados de contacto estão preenchidos no perfil.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Configurar Preferências de Notificação \\ \hline
\textbf{Requisitos associados} & RF-04, RNF-07 \\ \hline
\textbf{Ator} & Qualquer utilizador autenticado \\ \hline
\textbf{Descrição} & O utilizador define quais os eventos que deseja receber e por que canal (email, SMS ou notificação \textit{in-app}). \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado e tem email e/ou telefone registado no perfil. \\ \hline
\textbf{Pós-condição} & As preferências são persistidas e o motor de notificações respeita-as nos envios futuros. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador acede à secção ``Notificações'' do seu perfil. \newline
2. O sistema apresenta a lista de tipos de evento (convocatórias, quotas, atestados, etc.) e os canais disponíveis. \newline
3. O utilizador ativa ou desativa combinações evento/canal. \newline
4. O sistema persiste as preferências na base de dados. \\ \hline
\textbf{Fluxo alternativo 1} &
[canal sem dados de contacto associados] (passo 3) \newline
3.1. O sistema alerta que o canal SMS não está disponível por falta de número de telemóvel no perfil. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Configurar Preferências de Notificação''.}
\label{tab:uc_config_notif}
\end{table}
\rowcolors{2}{white}{white}
"""

anchor_uc_util = r"""O caso de uso \textit{Criar Convocatória}"""
tex = replace_block(tex, anchor_uc_util, uc_utilizadores + '\n' + anchor_uc_util)
print('3a. UC Utilizadores (RF-02, RF-03, RF-04) inserted')

# ----- 3b. Gestão Desportiva: RF-05, RF-06, RF-07, RF-09, RF-10, RF-15, RF-16 -----
uc_desportiva = r"""
O caso de uso \textit{Gerir Modalidades e Épocas} (Tabela~\ref{tab:uc_gerir_epoca}) é uma operação exclusiva da Gerência derivada do \textbf{RF-05}, que exige que o sistema suporte a gestão completa do ciclo de épocas desportivas, incluindo a transição automática de escalões. É a operação que inicia formalmente cada nova época, gerando as quotas correspondentes a todos os atletas inscritos.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Gerir Modalidades e Épocas \\ \hline
\textbf{Requisitos associados} & RF-05, RF-17 \\ \hline
\textbf{Ator} & Gerência \\ \hline
\textbf{Descrição} & A Gerência cria, edita ou fecha épocas desportivas e gere as modalidades disponíveis no clube. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado com papel de Gerência. \\ \hline
\textbf{Pós-condição} & A nova época fica ativa, os atletas são alocados aos escalões e as quotas da época são geradas automaticamente. \\ \hline
\textbf{Fluxo normal} &
1. A Gerência acede ao módulo de gestão de épocas e define o nome, data de início e fim. \newline
2. O sistema verifica que não existe uma época ativa em curso. \newline
3. A Gerência confirma a abertura da época. \newline
4. O sistema recalcula os escalões etários de todos os atletas ativos. \newline
5. O sistema gera automaticamente o plano de quotas para todos os atletas da nova época (\textbf{RF-17}). \\ \hline
\textbf{Fluxo de exceção 1} &
[época já ativa] (passo 2) \newline
2.1. O sistema informa que existe uma época ativa e exige o seu fecho antes de criar uma nova. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Gerir Modalidades e Épocas''.}
\label{tab:uc_gerir_epoca}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Agendar Sessão de Treino} (Tabela~\ref{tab:uc_agendar_treino}) concretiza o \textbf{RF-06} (Planeamento de Horários e Treinos). O agendamento reserva automaticamente o espaço físico, impedindo conflitos de ocupação entre equipas, e atualiza o calendário individual de cada atleta da equipa em tempo real.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Agendar Sessão de Treino \\ \hline
\textbf{Requisitos associados} & RF-06, RF-20 \\ \hline
\textbf{Ator} & Treinador / Gerência \\ \hline
\textbf{Descrição} & O treinador cria uma sessão de treino no calendário, reservando automaticamente a instalação correspondente. \\ \hline
\textbf{Pré-condição} & O treinador está autenticado e associado à equipa; a instalação existe na base de dados. \\ \hline
\textbf{Pós-condição} & A sessão é criada e o slot da instalação fica bloqueado; o calendário dos atletas é atualizado. \\ \hline
\textbf{Fluxo normal} &
1. O treinador seleciona a equipa e o espaço físico pretendido. \newline
2. O treinador define a data, hora de início e duração. \newline
3. O sistema verifica a ausência de conflitos de horário no espaço (\textbf{RF-20}). \newline
4. O sistema cria a sessão e reserva automaticamente o espaço. \newline
5. O sistema notifica os atletas da equipa sobre o novo treino (\textbf{RF-04}). \\ \hline
\textbf{Fluxo de exceção 1} &
[conflito de horário] (passo 3) \newline
3.1. O sistema informa que o espaço está ocupado e sugere alternativas. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Agendar Sessão de Treino''.}
\label{tab:uc_agendar_treino}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Registar Presenças em Treino} (Tabela~\ref{tab:uc_registar_presencas}) implementa o \textbf{RF-07} (Gestão de Presenças e Faltas). O treinador realiza o registo digital da chamada a partir de um dispositivo móvel, substituindo os registos em papel e alimentando automaticamente as estatísticas de assiduidade de cada atleta.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Registar Presenças em Treino \\ \hline
\textbf{Requisitos associados} & RF-07 \\ \hline
\textbf{Ator} & Treinador \\ \hline
\textbf{Descrição} & O treinador assinala a presença ou falta de cada atleta numa sessão de treino concluída. \\ \hline
\textbf{Pré-condição} & Sessão de treino criada no calendário; treinador autenticado e associado à equipa. \\ \hline
\textbf{Pós-condição} & O registo de assiduidade é persistido; as estatísticas individuais de cada atleta são atualizadas. \\ \hline
\textbf{Fluxo normal} &
1. O treinador acede à sessão de treino e abre a lista de chamada gerada automaticamente. \newline
2. Para cada atleta, o treinador seleciona: \textit{Presente}, \textit{Falta Justificada} ou \textit{Falta Injustificada}. \newline
3. Para faltas justificadas, o treinador regista o motivo. \newline
4. O treinador submete o registo. \newline
5. O sistema persiste os dados e atualiza as estatísticas de assiduidade em \textit{background}. \\ \hline
\textbf{Fluxo alternativo 1} &
[atleta lesionado] (passo 2) \newline
2.1. O sistema destaca automaticamente os atletas com estado \textit{Lesionado}; o treinador regista como \textit{Ausente por Lesão}. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Registar Presenças em Treino''.}
\label{tab:uc_registar_presencas}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Partilhar Plano de Treino} (Tabela~\ref{tab:uc_plano_treino}) implementa o \textbf{RF-09} (Planos de Treino e Recursos Táticos), centralizando o acesso a conteúdos técnicos numa plataforma controlada e eliminando a dispersão por canais informais. O isolamento de informação entre equipas é uma restrição crítica de segurança desportiva.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Partilhar Plano de Treino \\ \hline
\textbf{Requisitos associados} & RF-09, RNF-02 \\ \hline
\textbf{Ator} & Treinador \\ \hline
\textbf{Descrição} & O treinador carrega um plano de treino ou recurso tático e associa-o à sessão ou época correspondente. \\ \hline
\textbf{Pré-condição} & O treinador está autenticado e associado à equipa; o módulo de armazenamento tem espaço disponível. \\ \hline
\textbf{Pós-condição} & O ficheiro é armazenado e os atletas da equipa têm acesso imediato em modo leitura. \\ \hline
\textbf{Fluxo normal} &
1. O treinador seleciona a sessão de treino ou época e carrega o ficheiro (PDF, MP4 ou imagem). \newline
2. O sistema valida o formato e tamanho máximo (50 MB). \newline
3. O sistema armazena o ficheiro com isolamento por equipa (\textbf{RNF-02}). \newline
4. O sistema notifica os atletas da equipa sobre o novo conteúdo disponível. \\ \hline
\textbf{Fluxo de exceção 1} &
[formato ou tamanho inválido] (passo 2) \newline
2.1. O sistema rejeita o ficheiro e informa o treinador do formato ou tamanho permitido. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Partilhar Plano de Treino''.}
\label{tab:uc_plano_treino}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Registar Ocorrência de Jogo} (Tabela~\ref{tab:uc_ocorrencia_jogo}) materializa o \textbf{RF-10} (Registo de Ocorrências e Disciplina), que exige a distinção clara entre eventos desportivos (golos, cartões) e ocorrências disciplinares, sendo estas últimas passíveis de gerar suspensões que bloqueiam o atleta em convocatórias futuras.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Registar Ocorrência de Jogo \\ \hline
\textbf{Requisitos associados} & RF-10, RF-08 \\ \hline
\textbf{Ator} & Treinador / Gerência \\ \hline
\textbf{Descrição} & O treinador regista eventos ocorridos durante um jogo (golos, cartões, substituições, ocorrências disciplinares). \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado; o jogo está criado no calendário. \\ \hline
\textbf{Pós-condições} & As estatísticas do atleta são atualizadas; suspensões disciplinares ativas bloqueiam convocatórias. \\ \hline
\textbf{Fluxo normal} &
1. O treinador seleciona o jogo e o tipo de ocorrência (Evento de Jogo ou Ocorrência Disciplinar). \newline
2. O treinador seleciona o atleta visado e preenche os detalhes (minuto, tipo de cartão, etc.). \newline
3. O sistema regista a ocorrência no histórico do atleta. \newline
4. Se for cartão vermelho ou sanção federativa, o sistema aplica automaticamente a suspensão correspondente. \newline
5. O sistema bloqueia o atleta suspenso em novas convocatórias até ao término da suspensão. \\ \hline
\textbf{Fluxo alternativo 1} &
[ocorrência disciplinar grave] (passo 4) \newline
4.1. O sistema permite anexar o relatório oficial em PDF e notifica a Gerência. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Registar Ocorrência de Jogo''.}
\label{tab:uc_ocorrencia_jogo}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Consultar Dashboard de Desempenho} (Tabela~\ref{tab:uc_dashboard_desempenho}) implementa o \textbf{RF-15} (Painéis de Desempenho). O sistema agrega automaticamente os dados de assiduidade, ocorrências e métricas físicas em representações visuais adaptadas ao perfil do utilizador, garantindo isolamento de informação entre atletas.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Consultar Dashboard de Desempenho \\ \hline
\textbf{Requisitos associados} & RF-15 \\ \hline
\textbf{Ator} & Atleta / Encarregado / Treinador / Gerência \\ \hline
\textbf{Descrição} & O utilizador acede a uma visão gráfica personalizada do historial de desempenho desportivo. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado e existem dados acumulados no sistema. \\ \hline
\textbf{Pós-condição} & O sistema apresenta gráficos e tabelas em modo \textit{read-only}, ajustados ao nível de acesso. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador acede ao painel de desempenho. \newline
2. O sistema agrega dados de assiduidade, ocorrências, lesões e métricas físicas. \newline
3. O utilizador aplica filtros temporais (época atual, últimos 30 dias, época anterior). \newline
4. O sistema renderiza os gráficos e tabelas adaptados ao papel do utilizador. \newline
5. A Gerência pode exportar o relatório para PDF ou Excel. \\ \hline
\textbf{Fluxo alternativo 1} &
[dados insuficientes] (passo 2) \newline
2.1. O sistema informa que não há dados suficientes para o período selecionado e apresenta o histórico disponível. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Consultar Dashboard de Desempenho''.}
\label{tab:uc_dashboard_desempenho}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Registar Avaliação de Atleta} (Tabela~\ref{tab:uc_avaliar_atleta}) concretiza o \textbf{RF-16} (Avaliação Qualitativa e Objetivos), que permite à equipa técnica complementar os dados quantitativos com avaliações qualitativas e objetivos individuais de progressão, acessíveis ao atleta e ao seu encarregado em modo leitura.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Registar Avaliação de Atleta \\ \hline
\textbf{Requisitos associados} & RF-16 \\ \hline
\textbf{Ator} & Treinador \\ \hline
\textbf{Descrição} & O treinador regista uma avaliação qualitativa e/ou define objetivos individuais de progressão para um atleta. \\ \hline
\textbf{Pré-condição} & O treinador está autenticado e o atleta a avaliar pertence ao plantel. \\ \hline
\textbf{Pós-condição} & A avaliação é persistida; o atleta e o EE recebem uma notificação e têm acesso em leitura. \\ \hline
\textbf{Fluxo normal} &
1. O treinador seleciona o atleta e o contexto (treino ou jogo específico). \newline
2. O treinador preenche a avaliação com pontuações (escala 1--5) e texto livre. \newline
3. O treinador define opcionalmente um objetivo com prazo e estado inicial \textit{Em Curso}. \newline
4. O sistema persiste a avaliação e notifica o atleta e o EE. \\ \hline
\textbf{Fluxo de exceção 1} &
[tentativa de ver avaliação de outro atleta] (passo 1 — pelo Atleta) \newline
1.1. O sistema bloqueia o acesso e retorna HTTP 403 Forbidden. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Registar Avaliação de Atleta''.}
\label{tab:uc_avaliar_atleta}
\end{table}
\rowcolors{2}{white}{white}
"""

anchor_desportiva = r"""O caso de uso \textit{Submeter Atestado Médico}"""
tex = replace_block(tex, anchor_desportiva, uc_desportiva + '\n' + anchor_desportiva)
print('3b. UC Desportiva (RF-05,06,07,09,10,15,16) inserted')

# ----- 3c. Gestão Clínica: RF-12, RF-13, RF-14 -----
uc_clinica = r"""
O caso de uso \textit{Reportar Lesão} (Tabela~\ref{tab:uc_reportar_lesao}) implementa o \textbf{RF-12} (Gestão de Lesões e Recuperação), que exige que o sistema forneça um canal centralizado e auditável para o reporte e acompanhamento de indisponibilidades físicas, prevenindo que atletas lesionados sejam incluídos em convocatórias.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Reportar Lesão \\ \hline
\textbf{Requisitos associados} & RF-12, RF-04 \\ \hline
\textbf{Ator} & Atleta / Encarregado de Educação \\ \hline
\textbf{Descrição} & O atleta ou encarregado reporta uma lesão ou queixa física, tornando-a visível ao treinador e ao departamento médico. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado; o atleta tem perfil ativo integrado no plantel. \\ \hline
\textbf{Pós-condição} & O estado do atleta transita para \textit{Lesionado}; o treinador é notificado e o atleta fica bloqueado em convocatórias. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador acede à área de saúde e seleciona ``Reportar Queixa ou Lesão''. \newline
2. O utilizador preenche o formulário: zona corporal afetada, nível de dor (1--10), descrição, data de ocorrência. \newline
3. O sistema cria o registo de lesão com estado \textit{Reportada}. \newline
4. O sistema notifica o treinador e o departamento médico. \newline
5. O sistema destaca o atleta nas listas de plantel e bloqueia a sua convocação. \\ \hline
\textbf{Fluxo alternativo 1} &
[alta clínica] (pós-condição) \newline
A.1. O departamento médico regista a alta, transitando a lesão para \textit{Resolvida}. \newline
A.2. O sistema liberta o atleta para convocatórias. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Reportar Lesão''.}
\label{tab:uc_reportar_lesao}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Registar Dados Biométricos} (Tabela~\ref{tab:uc_biometria}) implementa o \textbf{RF-13} (Acompanhamento Físico e Evolução de Métricas). O registo periódico de indicadores antropométricos e biométricos gera o histórico longitudinal que suporta as decisões de carga de treino e recuperação, com acesso estritamente controlado em conformidade com o RGPD (\textbf{RNF-01}).

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Registar Dados Biométricos \\ \hline
\textbf{Requisitos associados} & RF-13, RNF-01 \\ \hline
\textbf{Ator} & Treinador / Departamento Médico / Atleta \\ \hline
\textbf{Descrição} & O utilizador regista ou atualiza os dados antropométricos e biométricos do atleta (peso, altura, IMC, frequência cardíaca). \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado; o atleta tem perfil ativo. \\ \hline
\textbf{Pós-condição} & Os dados são armazenados com data de registo; as métricas derivadas (IMC) são recalculadas e os gráficos atualizados. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador seleciona o atleta e acede ao módulo de métricas físicas. \newline
2. O utilizador insere os valores medidos. \newline
3. O sistema valida os valores (rejeita valores negativos ou implausíveis). \newline
4. O sistema calcula métricas derivadas (ex: IMC = peso / altura²). \newline
5. O sistema persiste os dados e atualiza os gráficos de evolução temporal. \\ \hline
\textbf{Fluxo de exceção 1} &
[valor implausível] (passo 3) \newline
3.1. O sistema rejeita o valor e assinala o campo com a faixa de valores aceitáveis. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Registar Dados Biométricos''.}
\label{tab:uc_biometria}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Submeter Documentação Federativa} (Tabela~\ref{tab:uc_doc_federativa}) concretiza o \textbf{RF-14} (Gestão Documental e Federativa). A centralização dos documentos de identificação é obrigatória para os processos de filiação federativa e ativação de apólices de seguro desportivo. O acesso é estritamente restrito ao remetente e à Secretaria/Gerência, bloqueando os treinadores expressamente.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Submeter Documentação Federativa \\ \hline
\textbf{Requisitos associados} & RF-14, RNF-01 \\ \hline
\textbf{Ator} & Atleta / Encarregado de Educação \\ \hline
\textbf{Descrição} & O utilizador carrega cópias digitais de documentos de identificação oficial para os processos federativos. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado e o atleta está associado a uma modalidade com inscrição federativa. \\ \hline
\textbf{Pós-condição} & Os documentos são armazenados de forma encriptada (RGPD) e a Secretaria é notificada para validação. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador acede à área de documentos e seleciona o tipo (Cartão de Cidadão, Passaporte, fotografia). \newline
2. O utilizador carrega o ficheiro (PDF, JPG, PNG, máx. 5 MB). \newline
3. O sistema valida o formato e encripta o documento (\textbf{RNF-01}). \newline
4. O sistema cria o pedido com estado \textit{A aguardar validação} e notifica a Secretaria. \\ \hline
\textbf{Fluxo de exceção 1} &
[formato ou tamanho inválido] (passo 2) \newline
2.1. O sistema rejeita o ficheiro e apresenta as restrições de formato e tamanho. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Submeter Documentação Federativa''.}
\label{tab:uc_doc_federativa}
\end{table}
\rowcolors{2}{white}{white}
"""

anchor_clinica = r"""O caso de uso \textit{Efetuar Pagamento}"""
tex = replace_block(tex, anchor_clinica, uc_clinica + '\n' + anchor_clinica)
print('3c. UC Clínica (RF-12, RF-13, RF-14) inserted')

# ----- 3d. Gestão Financeira: RF-18, RF-21, RF-22, RF-23 -----
uc_financeira = r"""
O caso de uso \textit{Consultar Contabilidade Global} (Tabela~\ref{tab:uc_contabilidade}) implementa o \textbf{RF-18} (Contabilidade Global do Clube), disponibilizando à Gerência e à Tesouraria uma visão centralizada de todas as despesas e receitas da organização. O acesso a este módulo é estritamente restrito aos perfis de topo, conforme a matriz RBAC da Tabela~\ref{tab:rbac}.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Consultar Contabilidade Global \\ \hline
\textbf{Requisitos associados} & RF-18, RNF-05 \\ \hline
\textbf{Ator} & Gerência / Tesouraria \\ \hline
\textbf{Descrição} & A Gerência acede ao painel financeiro centralizado com receitas, despesas e balanço por categoria. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado com papel de Gerência ou Tesouraria; existem movimentos financeiros registados. \\ \hline
\textbf{Pós-condição} & O sistema apresenta o painel financeiro com dados atualizados em tempo real. \\ \hline
\textbf{Fluxo normal} &
1. A Gerência acede ao módulo de contabilidade e seleciona o período de análise. \newline
2. O sistema agrega receitas (quotas, patrocínios) e despesas (pessoal, fornecedores) por categoria. \newline
3. O sistema renderiza gráficos comparativos (receitas vs.\ despesas) e tabelas detalhadas. \newline
4. A Gerência pode registar novas faturas de fornecedores com data limite de pagamento. \newline
5. A Gerência exporta o relatório financeiro em PDF ou Excel. \\ \hline
\textbf{Fluxo de exceção 1} &
[tentativa de acesso por utilizador sem permissão] \newline
O sistema retorna HTTP 403 Forbidden sem expor os dados. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Consultar Contabilidade Global''.}
\label{tab:uc_contabilidade}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Consultar Calendário de Eventos} (Tabela~\ref{tab:uc_calendario}) implementa o \textbf{RF-21} (Calendário de Eventos), que exige uma visão consolidada de todos os eventos da época (treinos, jogos, reservas). Cada papel visualiza apenas os eventos que lhe dizem respeito, garantindo o isolamento de informação definido na matriz RBAC.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Consultar Calendário de Eventos \\ \hline
\textbf{Requisitos associados} & RF-21, RF-06, RF-08 \\ \hline
\textbf{Ator} & Qualquer utilizador autenticado \\ \hline
\textbf{Descrição} & O utilizador consulta o calendário de eventos da época, filtrado de acordo com o seu papel e equipas associadas. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado. \\ \hline
\textbf{Pós-condição} & O calendário é apresentado em modo \textit{read-only} com os eventos relevantes para o utilizador. \\ \hline
\textbf{Fluxo normal} &
1. O utilizador acede ao calendário e seleciona a vista (mensal, semanal, diária). \newline
2. O sistema filtra os eventos com base no papel do utilizador e equipas associadas. \newline
3. O sistema renderiza os eventos com código de cores por tipo (treino, jogo, reserva). \newline
4. O utilizador clica num evento para ver os detalhes (local, hora, convocados). \\ \hline
\textbf{Fluxo alternativo 1} &
[sem eventos no período] (passo 3) \newline
3.1. O sistema apresenta o calendário vazio e sugere a navegação para períodos com eventos. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Consultar Calendário de Eventos''.}
\label{tab:uc_calendario}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Gerar Relatório de Gestão} (Tabela~\ref{tab:uc_relatorio_gestao}) implementa o \textbf{RF-22} (Relatórios de Gestão), que permite à Gerência produzir relatórios de síntese para apresentação a órgãos sociais ou entidades financiadoras, agregando dados de diferentes módulos do sistema.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Gerar Relatório de Gestão \\ \hline
\textbf{Requisitos associados} & RF-22 \\ \hline
\textbf{Ator} & Gerência \\ \hline
\textbf{Descrição} & A Gerência gera um relatório de síntese configurável que agrega dados desportivos, financeiros e clínicos para um período definido. \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado com papel de Gerência; existem dados suficientes no período selecionado. \\ \hline
\textbf{Pós-condição} & O relatório é gerado em PDF e fica disponível para download. \\ \hline
\textbf{Fluxo normal} &
1. A Gerência seleciona os módulos a incluir (desportivo, financeiro, clínico) e o período. \newline
2. O sistema agrega os dados dos módulos selecionados. \newline
3. O sistema gera o documento PDF com cabeçalho institucional e tabelas de síntese. \newline
4. O sistema disponibiliza o link de download seguro com tempo de expiração. \\ \hline
\textbf{Fluxo de exceção 1} &
[dados insuficientes para o período] (passo 2) \newline
2.1. O sistema informa quais os módulos sem dados e prossegue com os restantes. \\ \hline
\end{tabularx}
\caption{Caso de uso ``Gerar Relatório de Gestão''.}
\label{tab:uc_relatorio_gestao}
\end{table}
\rowcolors{2}{white}{white}

O caso de uso \textit{Consultar Logs de Auditoria} (Tabela~\ref{tab:uc_auditoria}) implementa o \textbf{RF-23} (Auditoria e Logs do Sistema), que exige o registo imutável de todas as operações sensíveis do sistema para fins de rastreabilidade, cumprimento do RGPD e resposta a incidentes de segurança. O acesso é exclusivo da Gerência.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Caso de uso} & Consultar Logs de Auditoria \\ \hline
\textbf{Requisitos associados} & RF-23, RNF-06 \\ \hline
\textbf{Ator} & Gerência \\ \hline
\textbf{Descrição} & A Gerência consulta o registo de auditoria de operações sensíveis realizadas no sistema (autenticações, aprovações, alterações de dados clínicos, pagamentos). \\ \hline
\textbf{Pré-condição} & O utilizador está autenticado com papel de Gerência. \\ \hline
\textbf{Pós-condição} & O sistema apresenta os registos de auditoria em modo \textit{read-only}. Os logs são imutáveis. \\ \hline
\textbf{Fluxo normal} &
1. A Gerência acede ao módulo de auditoria e define filtros (utilizador, tipo de operação, intervalo de datas). \newline
2. O sistema retorna a lista de eventos de auditoria correspondentes. \newline
3. A Gerência pode exportar os logs em CSV para análise externa. \\ \hline
\textbf{Fluxo de exceção 1} &
[tentativa de modificação de log] \newline
O sistema rejeita qualquer tentativa de escrita no registo de auditoria (imutabilidade garantida por design). \\ \hline
\end{tabularx}
\caption{Caso de uso ``Consultar Logs de Auditoria''.}
\label{tab:uc_auditoria}
\end{table}
\rowcolors{2}{white}{white}
"""

anchor_financeira = r"""O caso de uso \textit{Solicitar Reserva de Instalação}"""
tex = replace_block(tex, anchor_financeira, uc_financeira + '\n' + anchor_financeira)
print('3d. UC Financeira (RF-18, RF-21, RF-22, RF-23) inserted')

# ============================================================
# 4. SEQUENCE DIAGRAM — Login/JWT (add at beginning of section 4.5.3)
# ============================================================
seq_login_content = r"""
\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth,keepaspectratio,height=0.85\textheight]{sequencia_login.png}
    \caption{Diagrama de sequência relativo à autenticação e emissão de token JWT.}
    \label{fig:seq_login}
\end{figure}

A Figura~\ref{fig:seq_login} detalha o fluxo de autenticação crítico que precede qualquer operação protegida do sistema (\textbf{RF-01}, \textbf{RNF-01}, \textbf{RNF-03}). O utilizador submete as credenciais para o endpoint \texttt{POST /api/auth/login}. O Auth Module valida o \textit{hash bcrypt} da \textit{password} e verifica o estado da conta. Em caso de falha, o sistema incrementa um contador de tentativas por conta: ao atingir cinco tentativas falhadas, a conta é bloqueada por 15 minutos (\textbf{RNF-01}). Para contas válidas, é emitido um token JWT com expiração de 8 horas, contendo o papel do utilizador para aplicação do RBAC em cada pedido subsequente. O \textit{log} de acesso é registado para fins de auditoria (\textbf{RNF-06}).

"""

anchor_seq = r"""\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth,keepaspectratio,height=0.85\textheight]{sequencia_registo_utilizador.png}"""

tex = replace_block(tex, anchor_seq, seq_login_content + anchor_seq)
print('4. Login sequence diagram inserted')

# ============================================================
# 5. MOCKUP SECRETARIA (add after mockup_perfil_atleta)
# ============================================================
mockup_sec_content = r"""

\subsubsection{Dashboard da Secretaria (RF-01, RF-11, RF-14, RF-19)}

O \textit{dashboard} da Secretaria centraliza o fluxo de aprovações e validações administrativas, identificado pelo modelo de linguagem como o ecrã de maior criticidade operacional. O painel de ``Aprovações Pendentes'' apresenta em destaque os registos de utilizadores a aguardar ativação (\textbf{RF-01}), os atestados médicos a validar (\textbf{RF-11}) e os documentos federativos submetidos (\textbf{RF-14}). O uso de separadores permite à Secretaria gerir fila de trabalho heterogénea sem mudança de contexto. A disponibilidade do botão ``Exportar SAF-T'' (\textbf{RF-19}) e ``Registar Pagamento Manual'' (\textbf{RF-17}) diretamente no painel principal reduz o número de navegações necessárias para completar as tarefas mais frequentes.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth,height=0.85\textheight,keepaspectratio]{mockup_secretaria.png}
    \caption{Esboço do \textit{dashboard} principal da Secretaria.}
    \label{fig:mockup_secretaria}
\end{figure}

Este ecrã consome dados dos módulos de Utilizadores, Clínico e Financeiro, utilizando os \textit{endpoints} de aprovação de registo (\texttt{POST /api/users/\{id\}/approve}), validação de atestado (\texttt{POST /api/clinical/medical-exams/\{id\}/validate}) e geração de SAF-T.
"""

anchor_mockup = r"""A interface consome dados dos módulos Clínico e Financeiro, utilizando os \textit{endpoints} de submissão de ficheiros e consulta de extrato."""
tex = insert_after(tex, anchor_mockup, mockup_sec_content)
print('5. Secretaria mockup inserted')

# ============================================================
# 6. API — POST /api/auth/login (insert before first API table)
# ============================================================
api_login_content = r"""
\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Endpoint} & \texttt{POST /api/auth/login} \\ \hline
\textbf{Descrição} & Autentica um utilizador registado e ativo, emitindo um token de acesso JWT com o papel do utilizador para aplicação de RBAC nos pedidos subsequentes. \\ \hline
\textbf{Controlo de Acesso} & Público (não requer autenticação prévia) \\ \hline
\textbf{Payload (Pedido)} & JSON contendo \texttt{email} e \texttt{password}. \\ \hline
\textbf{Respostas} &
\textbf{200 OK}: \texttt{\{accessToken, expiresIn, role\}} --- token JWT válido por 8 horas. \newline
\textbf{401 Unauthorized}: Credenciais inválidas (email ou \textit{password} incorretos). \newline
\textbf{403 Forbidden}: Conta existe mas está em estado \textit{Pendente} ou \textit{Suspensa}. \newline
\textbf{423 Locked}: Conta bloqueada temporariamente após 5 tentativas falhadas (\textbf{RNF-01}). \\ \hline
\end{tabularx}
\caption{Especificação da API: autenticação e emissão de JWT.}
\label{tab:api_login}
\end{table}
\rowcolors{2}{white}{white}

"""

anchor_api = r"""\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{Campo}} & \textcolor{white}{\textbf{Descrição}} \\ \hline
\textbf{Endpoint} & \texttt{POST /api/users/register}"""

tex = replace_block(tex, anchor_api, api_login_content + anchor_api)
print('6. POST /api/auth/login endpoint inserted')

# ============================================================
# 7. REWRITE SECTION 4.8 — add traceability table
# ============================================================
old_sec48 = r"""\section{Validação da Especificação Construída}

Os artefactos produzidos ao longo deste capítulo foram revistos à luz dos requisitos funcionais e não funcionais elicitados nos capítulos anteriores, com o objetivo de confirmar que a especificação cobre integralmente as necessidades identificadas.

O \textbf{modelo de domínio} foi cruzado com os RF relativos à gestão de atletas, plantéis, convocatórias, quotas e instalações, verificando-se que todas as entidades relevantes e as suas relações se encontram representadas. O \textbf{diagrama de classes} foi validado face ao modelo de domínio, confirmando que todas as entidades conceptuais possuem uma correspondência de implementação com os atributos e métodos necessários para os fluxos descritos. O \textbf{diagrama de componentes} foi validado face às decisões arquiteturais, confirmando o alinhamento entre a decomposição em módulos e a opção de Monólito Modular.

Do lado comportamental, as \textbf{máquinas de estado} das quotas e das convocatórias foram confrontadas com os fluxos de exceção descritos nas tabelas de casos de uso, assegurando que todos os estados e transições relevantes se encontram contemplados. Os \textbf{diagramas de sequência} e de \textbf{atividade} validam, por sua vez, a correção dos principais fluxos de execução, nomeadamente o pagamento de quotas e a publicação de convocatórias. A \textbf{especificação de API} cobre os seis processos críticos identificados durante a análise de requisitos, estando cada \textit{endpoint} diretamente rastreável a um ou mais RF.

Conclui-se, assim, que o conjunto de artefactos produzidos --- decisões arquiteturais, modelo de domínio, diagrama de classes, diagrama de componentes, diagramas comportamentais, esboços de interface e especificação de API --- constitui uma base consistente e suficientemente detalhada para suportar as etapas de implementação e de testes do sistema."""

new_sec48 = r"""\section{Validação da Especificação Construída}

Os artefactos produzidos ao longo deste capítulo foram revistos à luz dos requisitos funcionais e não funcionais elicitados no capítulo anterior. A tabela de rastreabilidade seguinte mapeia cada requisito funcional aos artefactos que o cobrem, permitindo verificar a cobertura integral da especificação.

\rowcolors{2}{rowblue}{white}
\begin{table}[H]
\centering
\small
\begin{tabular}{|l|p{3.2cm}|c|c|c|c|c|c|}
\hline
\rowcolor{headerblue}\textcolor{white}{\textbf{RF}} & \textcolor{white}{\textbf{Nome}} & \textcolor{white}{\textbf{Dom.}} & \textcolor{white}{\textbf{Clas.}} & \textcolor{white}{\textbf{UC}} & \textcolor{white}{\textbf{Seq.}} & \textcolor{white}{\textbf{Atv.}} & \textcolor{white}{\textbf{API}} \\ \hline
RF-01 & Gestão de Utilizadores & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
RF-02 & Perfis Parentais & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-03 & Chat Interno & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-04 & Notificações & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark & --- \\ \hline
RF-05 & Modalidades e Épocas & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-06 & Horários e Treinos & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-07 & Presenças e Faltas & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-08 & Convocatórias & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
RF-09 & Planos de Treino & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-10 & Ocorrências/Disciplina & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-11 & Exame Médico (EMD) & \checkmark & \checkmark & \checkmark & --- & \checkmark & \checkmark \\ \hline
RF-12 & Lesões e Recuperação & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-13 & Métricas Físicas & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-14 & Documentação Federativa & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-15 & Dashboards Desempenho & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-16 & Avaliação Qualitativa & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-17 & Quotas e Pagamentos & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
RF-18 & Contabilidade Global & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-19 & Conformidade SAF-T & \checkmark & \checkmark & \checkmark & --- & --- & --- \\ \hline
RF-20 & Reserva Instalações & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\ \hline
RF-21 & Calendário de Eventos & \checkmark & --- & \checkmark & --- & --- & --- \\ \hline
RF-22 & Relatórios de Gestão & --- & --- & \checkmark & --- & --- & --- \\ \hline
RF-23 & Auditoria e Logs & --- & --- & \checkmark & --- & --- & --- \\ \hline
\end{tabular}
\caption{Tabela de rastreabilidade: RF versus artefactos de especificação (\checkmark = coberto, --- = não aplicável ou fora do âmbito do capítulo).}
\label{tab:rastreabilidade}
\end{table}
\rowcolors{2}{white}{white}

Do lado estrutural, o \textbf{modelo de domínio} representa todas as entidades e relações relevantes, o \textbf{diagrama de classes} aprofunda-o com detalhe de implementação, e o \textbf{diagrama de componentes} confirma o alinhamento entre a decomposição em módulos e a opção de Monólito Modular. O novo \textbf{diagrama de implantação} documenta a distribuição física dos artefactos e as integrações com serviços externos (Easypay, SendGrid). A \textbf{matriz RBAC} mapeia explicitamente os 5 papéis às operações principais, servindo de contrato de implementação para a camada de autorização.

Do lado comportamental, as \textbf{seis máquinas de estado} (Atleta, Quota, Convocatória, Atestado, Reserva, Lesão) cobrem todas as entidades com ciclos de vida críticos. Os \textbf{cinco diagramas de sequência} (autenticação JWT, registo, pagamento, convocatória, reserva) detalham os fluxos assíncronos e de resiliência. Os \textbf{cinco diagramas de atividade} complementam-nos com a lógica de controlo de fluxo dos algoritmos de negócio. As \textbf{trinta e sete tabelas de caso de uso} cobrem os vinte e três RF, garantindo a rastreabilidade completa dos fluxos normais e de exceção.

Os \textbf{esboços de interface} materializam os três perfis de utilizador com maior complexidade operacional (Treinador, Atleta/Encarregado, Secretaria), validando a adequação da estrutura de navegação ao modelo RBAC. A \textbf{especificação de API} documenta os sete \textit{endpoints} nucleares, incluindo o \textit{endpoint} de autenticação JWT, e serve como contrato de integração para a camada de apresentação.

Conclui-se que o conjunto de artefactos produzidos constitui uma base de especificação consistente e rastreável, cobrindo todos os vinte e três requisitos funcionais e os treze requisitos não funcionais elicitados no capítulo anterior, em conformidade com as boas práticas de Engenharia de Software (Sommerville, 2015)."""

tex = replace_block(tex, old_sec48, new_sec48)
print('7. Section 4.8 rewritten with traceability table')

# ============================================================
# WRITE OUTPUT
# ============================================================
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(tex)

print('\nDone. File written successfully.')
