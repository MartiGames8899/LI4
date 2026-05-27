#!/usr/bin/env python3
"""
Converte todas as UC tables (tabularx) do Cap. 4 para xltabular,
permitindo page breaks e uniformizando o estilo com as RF tables do Cap. 3.
"""
import re

FILEPATH = r'chapters/04_especificacao_modelacao.tex'

with open(FILEPATH, 'r', encoding='utf-8') as f:
    tex = f.read()

# Pattern: matches the entire UC table block
# Greedy on caption/label content, non-greedy on body
pattern = re.compile(
    r'\\rowcolors\{2\}\{rowblue\}\{white\}\n'
    r'\\begin\{table\}\[H\]\n'
    r'\\centering\n'
    r'\\begin\{tabularx\}\{\\textwidth\}\{\|l\|X\|\}\n'
    r'\\hline\n'
    r'\\rowcolor\{headerblue\}\\textcolor\{white\}\{\\textbf\{Campo\}\} & \\textcolor\{white\}\{\\textbf\{Descrição\}\} \\\\ \\hline\n'
    # body: anything that does NOT contain \end{tabularx} (negative lookahead)
    r'(?P<body>(?:(?!\\end\{tabularx\})[\s\S])*?)\n?'
    r'\\end\{tabularx\}\n'
    # caption: lazy match — captures the whole caption even with nested \textit{} etc.
    r'\\caption\{(?P<caption>.*?)\}\n'
    r'\\label\{(?P<label>[^}]+)\}\n'
    r'\\end\{table\}\n'
    r'\\rowcolors\{2\}\{white\}\{white\}',
    re.DOTALL
)

REPLACEMENT = (
    "{\\small\n"
    "\\rowcolors{2}{rowblue}{white}\n"
    "\\begin{xltabular}{\\textwidth}{|l|X|}\n"
    "\\hline\n"
    "\\rowcolor{headerblue}\\textcolor{white}{\\textbf{Campo}} & \\textcolor{white}{\\textbf{Descrição}} \\\\ \\hline\n"
    "\\endfirsthead\n"
    "\n"
    "\\multicolumn{2}{c}{{\\tablename\\ \\thetable{} -- Continuação}} \\\\\n"
    "\\hline\n"
    "\\rowcolor{headerblue}\\textcolor{white}{\\textbf{Campo}} & \\textcolor{white}{\\textbf{Descrição}} \\\\ \\hline\n"
    "\\endhead\n"
    "\n"
    "\\hline \\multicolumn{2}{|r|}{\\textit{Continua na próxima página\\ldots}} \\\\ \\hline \\endfoot\n"
    "\n"
    "\\hline\n"
    "\\caption{__CAPTION__}\n"
    "\\label{__LABEL__} \\\\\n"
    "\\endlastfoot\n"
    "\n"
    "__BODY__\n"
    "\\end{xltabular}\n"
    "}\n"
    "\\rowcolors{2}{white}{white}"
)

def replacer(m):
    return (REPLACEMENT
            .replace("__BODY__", m.group('body'))
            .replace("__CAPTION__", m.group('caption'))
            .replace("__LABEL__", m.group('label')))

new_tex, count = pattern.subn(replacer, tex)
print(f"Replaced {count} UC tables")

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.write(new_tex)

print("Done.")
