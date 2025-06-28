\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{modern1}[2024/01/01 Professional CV Class]

% Base class
\LoadClass[10pt, letterpaper]{article}

% Required packages
\RequirePackage[
    ignoreheadfoot,
    top=2 cm,
    bottom=2 cm,
    left=2 cm,
    right=2 cm,
    footskip=1.0 cm
]{geometry}
\RequirePackage[explicit]{titlesec}
\RequirePackage{tabularx}
\RequirePackage{array}
\RequirePackage[dvipsnames]{xcolor}
\RequirePackage{enumitem}
\RequirePackage{fontawesome5}
\RequirePackage{amsmath}
\RequirePackage{hyperref}
\RequirePackage[pscoord]{eso-pic}
\RequirePackage{calc}
\RequirePackage{bookmark}
\RequirePackage{lastpage}
\RequirePackage{changepage}
\RequirePackage{paracol}
\RequirePackage{ifthen}
\RequirePackage{needspace}
\RequirePackage{iftex}

% Font handling for different engines
\ifPDFTeX
    \input{glyphtounicode}
    \pdfgentounicode=1
    \RequirePackage[T1]{fontenc}
    \RequirePackage[utf8]{inputenc}
    \RequirePackage{lmodern}
\fi

\RequirePackage[default, type1]{sourcesanspro}

% Color definitions
\defincecolor{primaryColor}{RGB}{0, 128, 128}

% Basic settings
\AtBeginEnvironment{adjustwidth}{\partopsep0pt}
\pagestyle{empty}
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0pt}
\setlength{\topskip}{0pt}
\setlength{\columnsep}{0.15cm}

% Custom footer style
\makeatletter
\let\ps@customFooterStyle\ps@plain
\patchcmd{\ps@customFooterStyle}{\thepage}{
    \color{gray}\textit{\small \@author{} - Page \thepage{} of \pageref*{LastPage}}
}{}{} 
\makeatother

% Section formatting
\titleformat{\section}{
    \needspace{4\baselineskip}
    \Large\color{primaryColor}
}{
}{
}{
    \textbf{#1}\hspace{0.15cm}\titlerule[0.8pt]\hspace{-0.1cm}
}[]

\titlespacing{\section}{
    -1pt
}{
    0.3 cm
}{
    0.2 cm
}

% Custom environments
\newenvironment{highlights}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.4 cm + 10pt
    ]
}{
    \end{itemize}
}

\newenvironment{highlightsforbulletentries}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \end{itemize}
}

\newenvironment{onecolentry}{
    \begin{adjustwidth}{
        0.2 cm + 0.00001 cm
    }{
        0.2 cm + 0.00001 cm
    }
}{
    \end{adjustwidth}
}

\newenvironment{twocolentry}[2][]{
    \onecolentry
    \def\secondColumn{#2}
    \setcolumnwidth{\fill, 4.5 cm}
    \begin{paracol}{2}
}{
    \switchcolumn \raggedleft \secondColumn
    \end{paracol}
    \endonecolentry
}

\newenvironment{threecolentry}[3][]{
    \onecolentry
    \def\thirdColumn{#3}
    \setcolumnwidth{1 cm, \fill, 4.5 cm}
    \begin{paracol}{3}
    {\raggedright #2} \switchcolumn
}{
    \switchcolumn \raggedleft \thirdColumn
    \end{paracol}
    \endonecolentry
}

\newenvironment{header}{
    \setlength{\topsep}{0pt}\par\kern\topsep\centering\color{primaryColor}\linespread{1.5}
}{
    \par\kern\topsep
}

% Custom commands
\newcommand{\AND}{\unskip
    \cleaders\copy\ANDbox\hskip\wd\ANDbox
    \ignorespaces
}
\newsavebox\ANDbox
\sbox\ANDbox{}

\newcommand{\placelastupdatedtext}[1][Last updated]{
  \AddToShipoutPictureFG*{
    \put(
        \LenToUnit{\paperwidth-2 cm-0.2 cm+0.05cm},
        \LenToUnit{\paperheight-1.0 cm}
    ){\vtop{{\null}\makebox[0pt][c]{
        \small\color{gray}\textit{#1}\hspace{\widthof{#1}}
    }}}
  }
}

% External link formatting
\let\hrefWithoutArrow\href
\renewcommand{\href}[2]{\hrefWithoutArrow{#1}{\ifthenelse{\equal{#2}{}}{ }{#2 }\raisebox{.15ex}{\footnotesize \faExternalLink*}}}

% Hyperref setup
\AtBeginDocument{
    \hypersetup{
        pdftitle={\@title},
        pdfauthor={\@author},
        pdfcreator={LaTeX with Professional CV Class},
        colorlinks=true,
        urlcolor=primaryColor
    }
    \pagestyle{customFooterStyle}
}

% Header command
\newcommand{\makeheader}[6]{
    \begin{header}
        \fontsize{30 pt}{30 pt}
        \textbf{\@author}

        \vspace{0.3 cm}

        \normalsize
        \mbox{{\footnotesize\faMapMarker*}\hspace*{0.13cm}#1}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{mailto:#2}{{\footnotesize\faEnvelope[regular]}\hspace*{0.13cm}#2}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{tel:#3}{{\footnotesize\faPhone*}\hspace*{0.13cm}#3}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{#4}{{\footnotesize\faLink}\hspace*{0.13cm}#4}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{#5}{{\footnotesize\faLinkedinIn}\hspace*{0.13cm}#5}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{#6}{{\footnotesize\faGithub}\hspace*{0.13cm}#6}}%
    \end{header}
    \vspace{0.3 cm}
}

% Publication entry command
\newcommand{\publicationentry}[4]{
    \begin{samepage}
        \begin{twocolentry}{#1}
            \textbf{#2}
            \vspace{0.10 cm}
            #3
            \vspace{0.10 cm}
            \href{#4}{#4}
        \end{twocolentry}
    \end{samepage}
}

% Experience entry command  
\newcommand{\experienceentry}[5]{
    \begin{twocolentry}{#1 \\ #2}
        \textbf{#3}, #4
        \begin{highlights}
            #5
        \end{highlights}
    \end{twocolentry}
}

% Education entry command
\newcommand{\educationentry}[5]{
    \begin{threecolentry}{\textbf{#1}}{#2}
        \textbf{#3}, #4
        \begin{highlights}
            #5
        \end{highlights}
    \end{threecolentry}
}

% Project entry command
\newcommand{\projectentry}[3]{
    \begin{twocolentry}{#1}
        \textbf{#2}
        \begin{highlights}
            #3
        \end{highlights}
    \end{twocolentry}
}

% Skills entry command
\newcommand{\skillsentry}[2]{
    \begin{onecolentry}
        \textbf{#1:} #2
    \end{onecolentry}
}