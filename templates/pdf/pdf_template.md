---
title: Shadowdark Resources
lang: en
format:
    pdf:
        toc: true
        template-partials:
            - template/before-title.tex
        toc-depth: 3
        pdf-engine: lualatex
        spacing: onehalfspacing
        columnsep: 20pt
        documentclass: scrreprt
        pagesizes:
            width: 14.8cm
            height: 21cm
            left: 1cm
            right: 1cm
            top: 1.25cm
            bottom: 1.5cm
            bcor: 0cm
            bleed: 0.32cm
        classoption:
            - titlepage=firstiscover
            - toc=flat
            - twoside
        mainfont: Montserrat
        sansfont: Old Newspaper Font
        monofont: cascadia-code
        displayfont: JSL Blackletter
        fontsize: 10pt
        urlcolor: black
        title-top-spacing: "1cm"
        page-number-adjustment: "-0.8"
        filters:
            - template/columns.lua
        legal:
            fonts: |
                JSL Blackletter font © 2023 Jeffrey S. Lee.\
                Old Newspaper Types font © 2023 Manfred Klein.\
                Montserrat font family © 2023 Julieta Ulanovsky, Sol Matas, Juan Pablo del Peral, Jacques Le Bailly.
            shadowdark-license: |
                This work is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.

                This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at [https://dnd.wizards.com/resources/systems-reference-document](https://dnd.wizards.com/resources/systems-reference-document). The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at [https://creativecommons.org/licenses/by/4.0/legalcode](https://creativecommons.org/licenses/by/4.0/legalcode).
---


# Bestiary

::: {.twocolumns .ragged}
BESTIARY_CONTENT
:::

# Spells

::: {.twocolumns .ragged}
SPELL_CONTENT
:::

# Magic Items

::: {.twocolumns .ragged}
ITEM_CONTENT
:::
