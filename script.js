//
// FASE 1: MODELAGEM DOS DADOS (POO)
//

class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: GERENCIAMENTO DE ESTADO
//

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

// Salvar produtos no LocalStorage
function salvarNoLocalStorage() {
    try {
        const listaEmTexto = JSON.stringify(listaDeProdutos);
        localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
    } catch (erro) {
        mostrarErro("Não foi possível salvar os produtos no navegador.");
    }
}

// Carregar produtos salvos
function carregarDoLocalStorage() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
            const produtosObjetos = JSON.parse(dadosSalvos);

            if (!Array.isArray(produtosObjetos)) {
                throw new Error("Formato inválido");
            }

            produtosObjetos.forEach((prod) => {
                const produtoInstanciado = new Produto(
                    prod.nome,
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produtoInstanciado);
            });
        }
    } catch (erro) {
        mostrarErro("Não foi possível carregar os produtos salvos.");
    }
}

//
// FASE 3: CAPTURA DE ELEMENTOS DO HTML
//
const btnExportarCSV = document.getElementById("btn-exportar-csv");
const btnBackupJSON = document.getElementById("btn-backup-json");
const inputImportarJSON = document.getElementById("input-importar-json");

const formProduto = document.getElementById("produto-form");
const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");

const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");
const ordenarProdutos = document.getElementById("ordenar-produtos");

const tabelaBody = document.querySelector("#tabela-produtos tbody");
const mensagemVazia = document.getElementById("mensagem-vazia");

const mensagemErro = document.getElementById("mensagem-erro");
const mensagemSucesso = document.getElementById("mensagem-sucesso");

// Elementos do modal de confirmação
const modalConfirmacao = document.getElementById("modal-confirmacao");
const textoConfirmacao = document.getElementById("texto-confirmacao");
const btnCancelar = document.getElementById("btn-cancelar");
const btnConfirmar = document.getElementById("btn-confirmar");

// Elementos do modal Bootstrap
const btnBootstrap = document.getElementById("btn-bootstrap");
const modalBootstrap = document.getElementById("modal-bootstrap");
const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

//
// FASE 4: MENSAGENS INLINE
//

function mostrarErro(mensagem) {
    mensagemSucesso.hidden = true;
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

function mostrarSucesso(mensagem) {
    mensagemErro.hidden = true;
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.hidden = false;
}

function limparMensagens() {
    mensagemErro.hidden = true;
    mensagemSucesso.hidden = true;
    mensagemErro.textContent = "";
    mensagemSucesso.textContent = "";
}

//
// FASE 5: CADASTRO E VALIDAÇÃO DE PRODUTOS
//

formProduto.addEventListener("submit", function(event) {
    event.preventDefault();
    limparMensagens();

    const nome = nomeInput.value.trim();
    const preco = parseFloat(precoInput.value);
    const quantidade = Number(quantidadeInput.value);

    if (nome === "") {
        mostrarErro("Preencha o nome do produto!");
        nomeInput.focus();
        return;
    }

    if (
        precoInput.value === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        mostrarErro("Digite um preço válido e maior que zero!");
        precoInput.focus();
        return;
    }

    if (
        quantidadeInput.value === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        mostrarErro("Digite uma quantidade inteira maior que zero!");
        quantidadeInput.focus();
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);
    listaDeProdutos.push(novoProduto);
    salvarNoLocalStorage();
    atualizarInterface();
    formProduto.reset();
    mostrarSucesso("Produto cadastrado com sucesso!");
    nomeInput.focus();
});

//
// FASE 6: PESQUISA E ORDENAÇÃO DINÂMICA (V6)
//

ordenarProdutos.addEventListener("change", function() {
    atualizarInterface();
});

campoBusca.addEventListener("input", function() {
    atualizarInterface();
});

//
// FASE 7: MODAL DE CONFIRMAÇÃO
//

let acaoPendente = null;

function abrirModalExclusao(indexReal) {
    acaoPendente = {
        tipo: "excluir",
        indice: indexReal
    };
    textoConfirmacao.textContent = "Tem certeza de que deseja excluir este produto?";
    modalConfirmacao.hidden = false;
    btnCancelar.focus();
}

function abrirModalLimparTudo() {
    acaoPendente = {
        tipo: "limpar"
    };
    textoConfirmacao.textContent = "Tem certeza de que deseja remover TODOS os produtos do estoque? Essa ação não poderá ser desfeita.";
    modalConfirmacao.hidden = false;
    btnCancelar.focus();
}

function fecharModalConfirmacao() {
    modalConfirmacao.hidden = true;
    acaoPendente = null;
}

btnCancelar.addEventListener("click", function() {
    fecharModalConfirmacao();
});

btnConfirmar.addEventListener("click", function() {
    if (!acaoPendente) {
        return;
    }

    const acao = acaoPendente;
    fecharModalConfirmacao();

    if (acao.tipo === "excluir") {
        listaDeProdutos.splice(acao.indice, 1);
        salvarNoLocalStorage();
        atualizarInterface();
        mostrarSucesso("Produto removido com sucesso!");
    } else if (acao.tipo === "limpar") {
        listaDeProdutos.length = 0;
        salvarNoLocalStorage();
        atualizarInterface();
        mostrarSucesso("Todos os produtos foram removidos!");
    }
});

btnLimparTudo.addEventListener("click", function() {
    limparMensagens();
    if (listaDeProdutos.length === 0) {
        mostrarErro("O estoque já está vazio!");
        return;
    }
    abrirModalLimparTudo();
});

modalConfirmacao.addEventListener("click", function(event) {
    if (event.target === modalConfirmacao) {
        fecharModalConfirmacao();
    }
});

//
// FASE 8: MODAL CONCEITO BOOTSTRAP
//

btnBootstrap.addEventListener("click", function() {
    modalBootstrap.hidden = false;
    btnFecharBootstrap.focus();
});

btnFecharBootstrap.addEventListener("click", function() {
    modalBootstrap.hidden = true;
});

modalBootstrap.addEventListener("click", function(event) {
    if (event.target === modalBootstrap) {
        modalBootstrap.hidden = true;
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        fecharModalConfirmacao();
        modalBootstrap.hidden = true;
    }
});

//
// FASE 9: FILTRAGEM E ORDENAÇÃO DOS PRODUTOS (V6)
//

function obterProdutosProcessados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    // 1. Filtrar
    const filtrados = listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );

    // 2. Criar cópia rasa imutável para ordenação (Spread Operator)
    const comCopiaOrdenada = [...filtrados];
    const criterio = ordenarProdutos.value;

    // 3. Aplicar .sort() conforme a opção selecionada
    comCopiaOrdenada.sort((a, b) => {
        if (criterio === "menor-qtd") {
            return a.quantidade - b.quantidade;
        } else if (criterio === "maior-preco") {
            return b.preco - a.preco;
        } else if (criterio === "menor-preco") {
            return a.preco - b.preco;
        } else if (criterio === "alfabetica") {
            return a.nome.localeCompare(b.nome);
        }
        return 0; // Padrão (ordem de cadastro)
    });

    return comCopiaOrdenada;
}

//
// FASE 10: ATUALIZAÇÃO DO TOTAL EM ESTOQUE
//

function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: ${total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`;
}

//
// FASE 11: RENDERIZAÇÃO DA TABELA E ESTOQUE CRÍTICO (V6)
//

function renderizarTabela() {
    tabelaBody.innerHTML = "";

    const produtosProcessados = obterProdutosProcessados();

    if (produtosProcessados.length === 0 && listaDeProdutos.length > 0) {
        mensagemVazia.hidden = false;
    } else {
        mensagemVazia.hidden = true;
    }

    produtosProcessados.forEach((produto) => {
        // Recupera o índice real no array original para manter exclusão e edição corretas
        const indexReal = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");

        // REQUISITO V6: Destaque visual se quantidade <= 3
        if (produto.quantidade <= 3) {
            linha.classList.add("table-danger"); // Classe padrão do Bootstrap ou CSS customizado para alerta
        }

        const celulaNome = document.createElement("td");
        const celulaPreco = document.createElement("td");
        const celulaQuantidade = document.createElement("td");
        const celulaSubtotal = document.createElement("td");
        const celulaAcoes = document.createElement("td");

        // Exibe nome + indicador de estoque crítico se aplicável
        if (produto.quantidade <= 3) {
            celulaNome.innerHTML = `${produto.nome} <span class="badge bg-warning text-dark ms-2">Repor (Baixo)</span>`;
        } else {
            celulaNome.textContent = produto.nome;
        }

        celulaPreco.textContent = produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        celulaQuantidade.textContent = produto.quantidade;

        celulaSubtotal.textContent = produto.calcularSubtotal().toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.className = "btn btn-danger btn-sm";
        btnRemover.type = "button";

        btnRemover.addEventListener("click", function() {
            limparMensagens();
            abrirModalExclusao(indexReal);
        });

        celulaAcoes.appendChild(btnRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);
    });

    atualizarTotalEstoque(produtosProcessados);
}

//
// FASE 12: EXPORTAÇÃO CSV E BACKUP/RESTAURAÇÃO JSON (V6)
//

// 1. Botão Exportar CSV
if (btnExportarCSV) {
    btnExportarCSV.addEventListener("click", function() {
        if (listaDeProdutos.length === 0) {
            mostrarErro("Não há produtos para exportar!");
            return;
        }

        let conteudoCSV = "Nome;Preço;Quantidade;Subtotal\n";
        listaDeProdutos.forEach(prod => {
            conteudoCSV += `${prod.nome};${prod.preco};${prod.quantidade};${prod.calcularSubtotal()}\n`;
        });

        const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "estoque.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarSucesso("Arquivo CSV exportado com sucesso!");
    });
}

// 2. Botão Backup JSON
if (btnBackupJSON) {
    btnBackupJSON.addEventListener("click", function() {
        if (listaDeProdutos.length === 0) {
            mostrarErro("Não há dados para gerar backup!");
            return;
        }

        const dadosJSON = JSON.stringify(listaDeProdutos, null, 2);
        const blob = new Blob([dadosJSON], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "backup_estoque.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarSucesso("Backup em JSON realizado com sucesso!");
    });
}

// 3. Importação/Restauração JSON
if (inputImportarJSON) {
    inputImportarJSON.addEventListener("change", function(event) {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const conteudo = e.target.result;
                const dadosImportados = JSON.parse(conteudo);

                if (!Array.isArray(dadosImportados)) {
                    throw new Error("O arquivo JSON não contém um array válido de produtos.");
                }

                // Limpa a lista atual e reconstrói instanciando a classe Produto
                listaDeProdutos.length = 0;
                dadosImportados.forEach(prod => {
                    const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
                    listaDeProdutos.push(produtoInstanciado);
                });

                salvarNoLocalStorage();
                atualizarInterface();
                mostrarSucesso("Estoque restaurado com sucesso a partir do backup!");
            } catch (erro) {
                mostrarErro("Erro ao ler o arquivo JSON. Certifique-se de que é um backup válido.");
            }
        };
        reader.readAsText(arquivo);
        // Reseta o input para permitir importar o mesmo arquivo novamente se necessário
        inputImportarJSON.value = "";
    });
}

//
// FASE 13: ATUALIZAÇÃO GERAL DA INTERFACE
//

function atualizarInterface() {
    renderizarTabela();
}

//
// FASE 14: INICIALIZAÇÃO DO SISTEMA
//

carregarDoLocalStorage();
atualizarInterface();