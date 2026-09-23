const input = document.querySelector("#produto-input");

const adicionarBtn = document.querySelector("#adicionar-btn");
const limparInputBtn = document.querySelector("#limpar-input-btn");

const carrinhoElemento = document.querySelector("#carrinho");
const carrinhoVazio = document.querySelector("#carrinho-vazio");

const quantidadeItens = document.querySelector("#quantidade-itens");
const totalElemento = document.querySelector("#total");

const limparCarrinhoBtn = document.querySelector("#limpar-carrinho-btn");
const gerarBtn = document.querySelector("#gerar-btn");

const mensagem = document.querySelector("#mensagem");


let carrinho = [];


/* =========================
   UTILIDADES
========================= */

function moedaParaNumero(valor) {

    if (!valor) {
        return 0;
    }

    let texto = String(valor)
        .replace("R$", "")
        .trim();

    /*
        1.234,56
        ↓
        1234.56
    */

    if (texto.includes(",")) {

        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");

    }

    const numero = Number(texto);

    return Number.isFinite(numero)
        ? numero
        : 0;
}


function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


function mostrarMensagem(texto, tipo = "") {

    mensagem.textContent = texto;

    mensagem.className = "mensagem";

    if (tipo) {
        mensagem.classList.add(tipo);
    }

}


/* =========================
   PARSER TRIEER
========================= */

function interpretarLinha(linha) {

    linha = linha.trim();

    if (!linha) {
        return null;
    }

    /*
        Primeiro tentamos identificar TAB.

        Muitos sistemas Windows copiam tabelas
        utilizando TAB mesmo que visualmente
        pareçam apenas espaços.
    */

    let colunas;

    if (linha.includes("\t")) {

        colunas = linha
            .split(/\t+/)
            .map(coluna => coluna.trim())
            .filter(Boolean);

    } else {

        /*
            Caso o Trieer realmente envie espaços,
            usamos 2 ou mais espaços como separador.

            Isso mantém:

            DIPIRONA SODICA 500MG

            como um único campo.
        */

        colunas = linha
            .split(/\s{2,}/)
            .map(coluna => coluna.trim())
            .filter(Boolean);

    }


    /*
        Esperamos:

        0 = código
        1 = produto
        2 = unidade
        3 = preço sem desconto
        4 = desconto
        5 = preço final
    */

    if (colunas.length < 6) {
        return null;
    }


    /*
        Se por algum motivo existirem mais
        colunas no meio do nome, utilizamos
        os campos das extremidades.

        Código = primeiro
        Unidade / valores = últimos quatro

        Tudo entre eles pertence ao nome.
    */

    const codigo = colunas[0];

    const precoFinal = colunas[colunas.length - 1];

    const desconto = colunas[colunas.length - 2];

    const precoOriginal = colunas[colunas.length - 3];

    const unidade = colunas[colunas.length - 4];

    const nome = colunas
        .slice(1, colunas.length - 4)
        .join(" ");


    return {

        id: crypto.randomUUID(),

        codigo,

        nome,

        unidade,

        precoOriginal: moedaParaNumero(precoOriginal),

        desconto: desconto
            .replace("%", "")
            .trim(),

        precoFinal: moedaParaNumero(precoFinal)

    };

}


/* =========================
   PROCESSAR COLAGEM
========================= */

function processarEntrada() {

    const texto = input.value.trim();

    if (!texto) {

        mostrarMensagem(
            "Cole um produto antes de adicionar.",
            "erro"
        );

        return;

    }


    /*
        Permite colar vários produtos
        simultaneamente.
    */

    const linhas = texto
        .split(/\r?\n/)
        .filter(linha => linha.trim());


    let adicionados = 0;
    let erros = 0;


    linhas.forEach(linha => {

        const produto = interpretarLinha(linha);

        if (!produto) {

            erros++;

            return;

        }


        carrinho.push(produto);

        adicionados++;

    });


    renderizarCarrinho();


    if (adicionados > 0) {

        input.value = "";

        input.focus();

    }


    if (erros > 0) {

        mostrarMensagem(
            `${adicionados} produto(s) adicionado(s). ${erros} linha(s) não foram reconhecidas.`,
            "erro"
        );

    } else {

        mostrarMensagem(
            `${adicionados} produto(s) adicionado(s).`,
            "sucesso"
        );

    }

}


/* =========================
   RENDERIZAÇÃO
========================= */

function renderizarCarrinho() {

    carrinhoElemento.innerHTML = "";


    if (carrinho.length === 0) {

        carrinhoVazio.style.display = "block";

    } else {

        carrinhoVazio.style.display = "none";

    }


    carrinho.forEach(produto => {

        const linha = document.createElement("tr");


        linha.innerHTML = `

            <td>
                ${produto.codigo}
            </td>

            <td>
                ${produto.nome}
            </td>

            <td>
                ${produto.unidade}
            </td>

            <td>
                ${formatarMoeda(produto.precoOriginal)}
            </td>

            <td>
                ${produto.desconto}%
            </td>

            <td class="preco-final">
                ${formatarMoeda(produto.precoFinal)}
            </td>

            <td>
                <button
                    class="remover"
                    data-id="${produto.id}"
                    title="Remover produto"
                >
                    ×
                </button>
            </td>

        `;


        carrinhoElemento.appendChild(linha);

    });


    atualizarResumo();

}


/* =========================
   RESUMO
========================= */

function atualizarResumo() {

    const total = carrinho.reduce(
        (soma, produto) => soma + produto.precoFinal,
        0
    );


    totalElemento.textContent =
        formatarMoeda(total);


    quantidadeItens.textContent =
        `${carrinho.length} ${
            carrinho.length === 1
                ? "item"
                : "itens"
        }`;

}


/* =========================
   REMOVER
========================= */

function removerProduto(id) {

    carrinho = carrinho.filter(
        produto => produto.id !== id
    );


    renderizarCarrinho();


    mostrarMensagem(
        "Produto removido."
    );

}


/* =========================
   GERAR ORÇAMENTO
========================= */

async function gerarOrcamento() {

    if (carrinho.length === 0) {
        mostrarMensagem(
            "Adicione produtos antes de gerar o orçamento.",
            "erro"
        );

        return;
    }

    let orcamento = "ORÇAMENTO\n\n";

    carrinho.forEach(produto => {

        orcamento += `Produto: ${produto.nome}\n`;
        orcamento += `Unidade: ${produto.unidade}\n`;
        orcamento += `Preço: *${formatarMoeda(produto.precoFinal)}*\n\n`;

    });

    const total = carrinho.reduce(
        (soma, produto) => soma + produto.precoFinal,
        0
    );

    orcamento += `TOTAL: *${formatarMoeda(total)}*`;

    try {

        await navigator.clipboard.writeText(orcamento);

        mostrarMensagem(
            "Orçamento copiado para a área de transferência.",
            "sucesso"
        );

    } catch (erro) {

        console.error(erro);

        mostrarMensagem(
            "Não foi possível copiar o orçamento.",
            "erro"
        );

    }
}

/* =========================
   EVENTOS
========================= */

adicionarBtn.addEventListener(
    "click",
    processarEntrada
);


limparInputBtn.addEventListener(
    "click",
    () => {

        input.value = "";

        input.focus();

        mostrarMensagem("");

    }
);


carrinhoElemento.addEventListener(
    "click",
    evento => {

        const botao =
            evento.target.closest(".remover");

        if (!botao) {
            return;
        }


        removerProduto(
            botao.dataset.id
        );

    }
);


limparCarrinhoBtn.addEventListener(
    "click",
    () => {

        carrinho = [];

        renderizarCarrinho();

        mostrarMensagem(
            "Carrinho limpo."
        );

    }
);


gerarBtn.addEventListener(
    "click",
    gerarOrcamento
);


/*
    CTRL + ENTER adiciona
*/

input.addEventListener(
    "keydown",
    evento => {

        if (
            evento.ctrlKey &&
            evento.key === "Enter"
        ) {

            processarEntrada();

        }

    }
);


/* =========================
   INICIALIZAÇÃO
========================= */

renderizarCarrinho();