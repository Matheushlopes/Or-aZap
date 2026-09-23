const custoInput = document.querySelector("#custo");
const vendaInput = document.querySelector("#venda");
const margemInput = document.querySelector("#margem");

const debitoInput = document.querySelector("#debito");
const creditoInput = document.querySelector("#credito");
const comissaoInput = document.querySelector("#comissao");

const grupoVenda = document.querySelector("#grupo-venda");
const grupoMargem = document.querySelector("#grupo-margem");

const modeButtons = document.querySelectorAll(".mode");

let modo = "venda";


/* =========================
   UTILIDADES
========================= */

function numero(input) {

    const valor = parseFloat(input.value);

    return Number.isFinite(valor)
        ? valor
        : 0;

}


function moeda(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function percentual(valor) {

    return `${valor.toFixed(2).replace(".", ",")}%`;

}


function definirClasse(elemento, valor) {

    elemento.classList.remove(
        "positive",
        "negative"
    );

    if (valor > 0) {

        elemento.classList.add("positive");

    } else if (valor < 0) {

        elemento.classList.add("negative");

    }

}


/* =========================
   CÁLCULO BASE
========================= */

function calcularResultado(
    custo,
    venda,
    taxa,
    comissao
) {

    const lucroBruto =
        venda - custo;


    const valorTaxa =
        venda * (taxa / 100);


    const valorComissao =
        venda * (comissao / 100);


    const lucroLiquido =
        venda
        - custo
        - valorTaxa
        - valorComissao;


    const margemBruta =
        venda > 0
            ? (lucroBruto / venda) * 100
            : 0;


    const margemLiquida =
        venda > 0
            ? (lucroLiquido / venda) * 100
            : 0;


    return {

        lucroBruto,

        valorTaxa,

        valorComissao,

        lucroLiquido,

        margemBruta,

        margemLiquida

    };

}


/* =========================
   PREÇO POR MARGEM
========================= */

/*

Queremos:

margem =
(venda - custo - taxas) / venda


Exemplo:

Custo = 60

Margem líquida desejada = 40%
Comissão = 5%
Crédito = 3.49%

Venda =
60 / (1 - 0.40 - 0.05 - 0.0349)

*/

function calcularPrecoPorMargem(
    custo,
    margem,
    taxa,
    comissao
) {

    const percentualTotal =
        (margem + taxa + comissao) / 100;


    const divisor =
        1 - percentualTotal;


    if (divisor <= 0) {

        return 0;

    }


    return custo / divisor;

}


/* =========================
   ATUALIZAR RESULTADO
========================= */

function calcular() {

    const custo = numero(custoInput);

    const debito = numero(debitoInput);

    const credito = numero(creditoInput);

    const comissao = numero(comissaoInput);


    let venda;


    /* =====================
       MODO PREÇO DE VENDA
    ===================== */

    if (modo === "venda") {

        venda = numero(vendaInput);

    }


    /* =====================
       MODO MARGEM
    ===================== */

    else {

        const margemDesejada =
            numero(margemInput);


        /*
            Utilizamos o crédito como cenário
            principal porque normalmente possui
            a maior taxa.

            Os outros meios são comparados abaixo.
        */

        venda =
            calcularPrecoPorMargem(
                custo,
                margemDesejada,
                credito,
                comissao
            );

    }


    atualizarResumo(
        custo,
        venda,
        credito,
        comissao
    );


    atualizarComparador(
        custo,
        venda,
        debito,
        credito,
        comissao
    );

}


/* =========================
   RESUMO PRINCIPAL
========================= */

function atualizarResumo(
    custo,
    venda,
    taxa,
    comissao
) {

    const resultado =
        calcularResultado(
            custo,
            venda,
            taxa,
            comissao
        );


    const mainResult =
        document.querySelector("#main-result");


    document.querySelector(
        "#resultado-venda"
    ).textContent =
        moeda(venda);


    document.querySelector(
        "#resultado-custo"
    ).textContent =
        moeda(custo);


    document.querySelector(
        "#lucro-bruto"
    ).textContent =
        moeda(resultado.lucroBruto);


    document.querySelector(
        "#margem-bruta"
    ).textContent =
        percentual(resultado.margemBruta);


    mainResult.textContent =
        moeda(resultado.lucroLiquido);


    document.querySelector(
        "#main-margin"
    ).textContent =
        `Margem líquida: ${
            percentual(resultado.margemLiquida)
        }`;


    definirClasse(
        mainResult,
        resultado.lucroLiquido
    );

}


/* =========================
   CARD
========================= */

function atualizarCard(
    prefixo,
    custo,
    venda,
    taxa,
    comissao
) {

    const resultado =
        calcularResultado(
            custo,
            venda,
            taxa,
            comissao
        );


    const lucroElemento =
        document.querySelector(
            `#${prefixo}-lucro`
        );


    lucroElemento.textContent =
        moeda(resultado.lucroLiquido);


    document.querySelector(
        `#${prefixo}-taxa`
    ).textContent =
        `- ${moeda(resultado.valorTaxa)}`;


    document.querySelector(
        `#${prefixo}-comissao`
    ).textContent =
        `- ${moeda(resultado.valorComissao)}`;


    document.querySelector(
        `#${prefixo}-margem`
    ).textContent =
        percentual(resultado.margemLiquida);


    definirClasse(
        lucroElemento,
        resultado.lucroLiquido
    );

}


/* =========================
   COMPARADOR
========================= */

function atualizarComparador(
    custo,
    venda,
    debito,
    credito,
    comissao
) {

    /* PIX */

    atualizarCard(
        "pix",
        custo,
        venda,
        0,
        comissao
    );


    /* DÉBITO */

    atualizarCard(
        "debito",
        custo,
        venda,
        debito,
        comissao
    );


    /* CRÉDITO */

    atualizarCard(
        "credito",
        custo,
        venda,
        credito,
        comissao
    );


    document.querySelector(
        "#debito-label"
    ).textContent =
        percentual(debito);


    document.querySelector(
        "#credito-label"
    ).textContent =
        percentual(credito);

}


/* =========================
   MODO
========================= */

function alterarModo(novoModo) {

    modo = novoModo;


    modeButtons.forEach(botao => {

        botao.classList.toggle(
            "active",
            botao.dataset.mode === modo
        );

    });


    if (modo === "venda") {

        grupoVenda.classList.remove(
            "hidden"
        );

        grupoMargem.classList.add(
            "hidden"
        );

    } else {

        grupoVenda.classList.add(
            "hidden"
        );

        grupoMargem.classList.remove(
            "hidden"
        );

    }


    calcular();

}


/* =========================
   LOCAL STORAGE
========================= */

function salvarTaxas() {

    const configuracoes = {

        debito: numero(debitoInput),

        credito: numero(creditoInput),

        comissao: numero(comissaoInput)

    };


    localStorage.setItem(
        "calculadoraMargemConfig",
        JSON.stringify(configuracoes)
    );

}


function carregarTaxas() {

    const dados =
        localStorage.getItem(
            "calculadoraMargemConfig"
        );


    if (!dados) {
        return;
    }


    try {

        const config =
            JSON.parse(dados);


        if (
            typeof config.debito === "number"
        ) {

            debitoInput.value =
                config.debito;

        }


        if (
            typeof config.credito === "number"
        ) {

            creditoInput.value =
                config.credito;

        }


        if (
            typeof config.comissao === "number"
        ) {

            comissaoInput.value =
                config.comissao;

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar configurações.",
            erro
        );

    }

}


/* =========================
   EVENTOS
========================= */

modeButtons.forEach(botao => {

    botao.addEventListener(
        "click",
        () => {

            alterarModo(
                botao.dataset.mode
            );

        }
    );

});


[
    custoInput,
    vendaInput,
    margemInput

].forEach(input => {

    input.addEventListener(
        "input",
        calcular
    );

});


[
    debitoInput,
    creditoInput,
    comissaoInput

].forEach(input => {

    input.addEventListener(
        "input",
        () => {

            salvarTaxas();

            calcular();

        }
    );

});


/* =========================
   INICIALIZAÇÃO
========================= */

carregarTaxas();

calcular();