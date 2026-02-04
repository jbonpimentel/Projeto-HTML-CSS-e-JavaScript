// =====================================================
// LOGIN
// =====================================================
const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");
const btnLogin = document.getElementById("btnLogin");

if (form && btnLogin) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    btnLogin.textContent = "Entrando...";
    btnLogin.disabled = true;

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    setTimeout(() => {
      if (email === "joao@evoplan.com" && senha === "123456") {
        localStorage.setItem("logado", "true");
        window.location.href = "menu.html";
      } else {
        mensagem.textContent = "Credenciais inválidas";
        mensagem.style.color = "#991b1b";
        mensagem.style.backgroundColor = "#fee2e2";
        btnLogin.textContent = "Entrar";
        btnLogin.disabled = false;
      }
    }, 500);
  });
}

// =====================================================
// AUTENTICAÇÃO (proteção de páginas)
// =====================================================
const estaNaTelaDeLogin = !!form;
const logado = localStorage.getItem("logado");

if (!estaNaTelaDeLogin && logado !== "true") {
  window.location.href = "login.html";
}

// =====================================================
// LOGOUT
// =====================================================
const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
  });
}

// =====================================================
// MODAL DE CLIENTES (editar)
// =====================================================
const modal = document.getElementById("modalEditar");
const btnCancelar = document.getElementById("btnCancelar");
const btnSalvar = document.getElementById("btnSalvar");

const inputNome = document.getElementById("editNome");
const inputTelefone = document.getElementById("editTelefone");
const inputEmail = document.getElementById("editEmail");
const inputEndereco = document.getElementById("editEndereco");

let clienteEditando = null;

// Abrir modal
document.querySelectorAll(".btn-editar").forEach(botao => {
  botao.addEventListener("click", function () {
    const linha = this.closest("tr");
    if (!linha || !modal) return;

    clienteEditando = linha;

    inputNome.value = linha.querySelector(".col-nome")?.textContent || "";
    inputTelefone.value = linha.querySelector(".col-telefone")?.textContent || "";
    inputEmail.value = linha.querySelector(".col-email")?.textContent || "";
    inputEndereco.value = linha.querySelector(".col-endereco")?.textContent || "";

    modal.classList.remove("hidden");
  });
});

// Cancelar modal
if (btnCancelar && modal) {
  btnCancelar.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

// Salvar alterações
if (btnSalvar && modal) {
  btnSalvar.addEventListener("click", () => {
    if (!clienteEditando) return;

    clienteEditando.querySelector(".col-nome").textContent = inputNome.value;
    clienteEditando.querySelector(".col-telefone").textContent = inputTelefone.value;
    clienteEditando.querySelector(".col-email").textContent = inputEmail.value;
    clienteEditando.querySelector(".col-endereco").textContent = inputEndereco.value;

    const id = clienteEditando.dataset.id;
    if (id) {
      const clientes = JSON.parse(localStorage.getItem("clientes")) || {};
      clientes[id] = {
        nome: inputNome.value,
        telefone: inputTelefone.value,
        email: inputEmail.value,
        endereco: inputEndereco.value
      };
      localStorage.setItem("clientes", JSON.stringify(clientes));
    }

    modal.classList.add("hidden");
  });
}

// Carregar clientes salvos
const clientesSalvos = JSON.parse(localStorage.getItem("clientes")) || {};
document.querySelectorAll("tr[data-id]").forEach(linha => {
  const dados = clientesSalvos[linha.dataset.id];
  if (!dados) return;

  linha.querySelector(".col-nome").textContent = dados.nome;
  linha.querySelector(".col-telefone").textContent = dados.telefone;
  linha.querySelector(".col-email").textContent = dados.email;
  linha.querySelector(".col-endereco").textContent = dados.endereco;
});

// =====================================================
// FILTRO DE PRODUTOS (por nome)
// =====================================================
const filterInput = document.getElementById("filterInput");

if (filterInput) {
  filterInput.addEventListener("input", () => {
    const termo = filterInput.value.toLowerCase();

    document.querySelectorAll("tbody tr").forEach(row => {
      const nome = row.querySelector(".product-name")?.innerText.toLowerCase() || "";
      row.style.display = nome.includes(termo) ? "" : "none";
    });
  });
}

// =====================================================
// ORDENAÇÃO DE PRODUTOS (por preço)
// =====================================================
const priceSort = document.getElementById("priceSort");
const tbody = document.querySelector("table tbody");

function extrairPreco(texto) {
  return parseFloat(
    texto
      .replace("$", "")
      .replace(",", ".")
      .trim()
  );
}

if (priceSort && tbody) {
  priceSort.addEventListener("change", () => {
    const linhas = Array.from(tbody.querySelectorAll("tr"));

    linhas.sort((a, b) => {
      const precoA = extrairPreco(a.querySelector(".price").innerText);
      const precoB = extrairPreco(b.querySelector(".price").innerText);

      return priceSort.value === "asc"
        ? precoA - precoB
        : precoB - precoA;
    });

    linhas.forEach(linha => tbody.appendChild(linha));
  });
}
// =====================================================
// CLIENTES: ATIVAR / INATIVAR (SUPER ROBUSTO)
// - Não depende de classe específica no botão
// - Não depende de tr[data-id]
// - Procura status em .status OU .col-status
// =====================================================

// Gera uma "chave" estável para salvar status mesmo sem data-id
function getClienteKeyFromRow(row) {
  const id = row?.dataset?.id;
  if (id) return `id:${id}`;

  // tenta usar email (se existir na linha) como chave
  const emailCell = row.querySelector(".col-email");
  const email = emailCell?.textContent?.trim();
  if (email) return `email:${email.toLowerCase()}`;

  // fallback: índice da linha (menos estável, mas funciona)
  return `row:${row.rowIndex}`;
}

function getStatusEl(row) {
  return row.querySelector(".status") || row.querySelector(".col-status");
}

function setStatusUI(row, ativo) {
  const statusEl = getStatusEl(row);
  if (statusEl) {
    statusEl.classList.toggle("ativo", ativo);
    statusEl.classList.toggle("inativo", !ativo);
    statusEl.textContent = ativo ? "Ativo" : "Inativo";
  }

  // acha o botão certo: tenta por texto, depois por classes comuns
  const btn =
    Array.from(row.querySelectorAll("button, a")).find(el => {
      const t = (el.textContent || "").trim().toLowerCase();
      return t === "inativar" || t === "ativar";
    }) ||
    row.querySelector(".btn-toggle-status, .btn-inativar, .btn-ativar");

  if (btn) btn.textContent = ativo ? "Inativar" : "Ativar";
}

function salvarStatus(key, ativo) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || {};
  clientes[key] = clientes[key] || {};
  clientes[key].status = ativo ? "ativo" : "inativo";
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function lerStatus(key) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || {};
  return clientes[key]?.status; // "ativo" | "inativo" | undefined
}

// Clique (delegação): pega qualquer botão cujo texto seja Ativar/Inativar
document.addEventListener("click", (event) => {
  const alvo = event.target.closest("button, a");
  if (!alvo) return;

  const texto = (alvo.textContent || "").trim().toLowerCase();
  const ehToggle =
    texto === "inativar" ||
    texto === "ativar" ||
    alvo.classList.contains("btn-toggle-status") ||
    alvo.classList.contains("btn-inativar") ||
    alvo.classList.contains("btn-ativar");

  if (!ehToggle) return;

  const row = alvo.closest("tr");
  if (!row) return;

  const statusEl = getStatusEl(row);
  if (!statusEl) {
    console.warn("❌ Não achei elemento de status (.status ou .col-status) nessa linha.");
    return;
  }

  const ativoAgora = statusEl.classList.contains("ativo");
  const novoAtivo = !ativoAgora;

  setStatusUI(row, novoAtivo);

  const key = getClienteKeyFromRow(row);
  salvarStatus(key, novoAtivo);
});

// Ao carregar, reaplica status salvo em cada linha
(function aplicarStatusAoCarregar() {
  document.querySelectorAll("tbody tr, tr").forEach((row) => {
    const statusEl = getStatusEl(row);
    if (!statusEl) return;

    const key = getClienteKeyFromRow(row);
    const status = lerStatus(key);
    if (!status) return;

    setStatusUI(row, status === "ativo");
  });
})();
// =====================================================
// PRODUTOS: MODAL "NOVO PRODUTO"
// =====================================================
const btnNovo = document.getElementById("btnNovoProduto");
const modalProduto = document.getElementById("modalProduto");
const btnCancelarProduto = document.getElementById("cancelarProduto");
const btnSalvarProduto = document.getElementById("salvarProduto");
const tbodyProdutos = document.querySelector("table tbody");


function abrirModalProduto() {
  modalProduto.classList.remove("hidden");
}

function fecharModalProduto() {
  modalProduto.classList.add("hidden");
}

if (btnNovo) btnNovo.addEventListener("click", abrirModalProduto);
if (btnCancelarProduto) btnCancelarProduto.addEventListener("click", fecharModalProduto);

// fechar clicando fora do conteúdo
if (modalProduto) {
  modalProduto.addEventListener("click", (e) => {
    if (e.target === modalProduto) fecharModalProduto();
  });
}

if (btnSalvarProduto && tbodyProdutos) {
  btnSalvarProduto.addEventListener("click", () => {
    const nome = document.getElementById("nomeProduto")?.value.trim() || "";
    const attr1 = document.getElementById("attr1")?.value.trim() || "";
    const attr2 = document.getElementById("attr2")?.value.trim() || "";
    const preco = document.getElementById("preco")?.value.trim() || "";

    if (!nome || !preco) {
      alert("Preencha Nome e Preço.");
      return;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-img"></td>
      <td class="product-name">${nome}</td>
      <td class="muted">${attr1}</td>
      <td class="muted">${attr2}</td>
      <td class="muted">Novo</td>
      <td class="muted">0</td>
      <td>-</td>
      <td class="price">$${preco}</td>
      <td class="col-qty"><input class="qty" type="number" value="1"></td>
      <td class="col-action"><button class="btn" type="button">Adicionar ao carrinho</button></td>
    `;

    tbodyProdutos.appendChild(tr);

    // limpa inputs
    document.getElementById("nomeProduto").value = "";
    document.getElementById("attr1").value = "";
    document.getElementById("attr2").value = "";
    document.getElementById("preco").value = "";

    fecharModalProduto();
  });
}

// =====================================================
// PRODUTOS: SELECIONAR LINHA + EXCLUIR (BOTÃO FIXO)
// =====================================================
const btnExcluirSelecionado = document.getElementById("btnExcluirSelecionado");
let linhaSelecionada = null;

// clicar na linha seleciona
document.addEventListener("click", (e) => {
  const row = e.target.closest("tbody tr");
  if (!row) return;

  // não selecionar quando clicar em input/botão/link
  if (e.target.closest("button, a, input, select, textarea")) return;

  // toggle seleção
  if (linhaSelecionada === row) {
    row.classList.remove("is-selected");
    linhaSelecionada = null;
    return;
  }

  document.querySelectorAll("tbody tr.is-selected").forEach(tr => tr.classList.remove("is-selected"));
  row.classList.add("is-selected");
  linhaSelecionada = row;
});

if (btnExcluirSelecionado) {
  btnExcluirSelecionado.addEventListener("click", () => {
    if (!linhaSelecionada) {
      alert("Selecione um produto clicando na linha primeiro.");
      return;
    }

    const confirmar = confirm("Deseja excluir o produto selecionado?");
    if (!confirmar) return;

    linhaSelecionada.remove();
    linhaSelecionada = null;
  });
}

const btnAdicionar = document.getElementById("addcliente");
const modalAdicionar = document.getElementById("modalAdicionar");
const btnCancelarNovo = document.getElementById("btnCancelarNovo");

btnAdicionar.addEventListener("click", () => {
  modalAdicionar.classList.remove("hidden");
});

btnCancelarNovo.addEventListener("click", () => {
  modalAdicionar.classList.add("hidden");
});
const btnSalvarNovo = document.getElementById("btnSalvarNovo");
const tabela = document.querySelector("tbody");

btnSalvarNovo.addEventListener("click", () => {
  const nome = novoNome.value;
  const cpf = novoCpf.value;
  const telefone = novoTelefone.value;
  const email = novoEmail.value;
  const endereco = novoEndereco.value;
  const sexo = novoSexo.value;
  const nascimento = novoNascimento.value;

  if (!nome || !cpf) {
    alert("Preencha nome e CPF");
    return;
  }

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="col-img">👤</td>
    <td class="col-nome">${nome}</td>
    <td>${cpf}</td>
    <td class="col-telefone">${telefone}</td>
    <td class="col-email">${email}</td>
    <td class="col-endereco">${endereco}</td>
    <td><span class="status ativo">Ativo</span></td>
    <td>${sexo}</td>
    <td>${nascimento}</td>
    <td class="col-action">
      <button class="btn btn-editar">Editar</button>
      <button class="btn btn-inativar">Inativar</button>
    </td>
  `;

  tabela.appendChild(tr);

  modalAdicionar.classList.add("hidden");
});
