let token = "";
const API_URL = "http://localhost:3000";

// ==========================
//      LOGIN ADMIN
// ==========================
function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    document.getElementById("login-msg").innerText = "Tentando entrar...";

    fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                const msg = data.message || `Erro HTTP ${res.status}`;
                document.getElementById("login-msg").innerText = msg;
                throw new Error(msg);
            });
        }
        return res.json();
    })
    .then(data => {
        token = data.token;
        document.getElementById("login-msg").innerText = "Login bem-sucedido!";
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";
        showSection('admin-menu-inicial'); // Exibe cadastro inicialmente
        listarProdutosAdmin();
    })
    .catch(err => {
        if (!document.getElementById("login-msg").innerText.includes("Erro")) {
            document.getElementById("login-msg").innerText = err.message || "Falha na conexão";
        }
        console.error("Erro login:", err);
    });
}

// ==========================
//      GERENCIAR SEÇÕES
// ==========================
function showSection(sectionId) {
    const sections = ['add-product-section', 'list-products-section'];
    sections.forEach(sec => document.getElementById(sec).style.display = 'none');

    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'block';

    if (sectionId === 'list-products-section') listarProdutosAdmin();
}

// ==========================
//      LISTAR PRODUTOS
// ==========================
function listarProdutosAdmin() {
    fetch(`${API_URL}/produtos`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("produtos-admin");
        container.innerHTML = "";

        if (data.message && data.message.includes("Token")) {
            container.innerHTML = `<p style="color:red;">Sessão expirada. Faça login novamente.</p>`;
            return;
        }

        data.forEach(p => {
            const div = document.createElement("div");
            div.classList.add("produto");
            div.innerHTML = `
                <img src="${p.imagem ? `${API_URL}/uploads/${p.imagem}` : 'https://via.placeholder.com/150'}" alt="${p.nome}">
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
                <p>R$ ${p.preco}</p>
                <p>Categoria: ${p.categoria}</p>
                <button onclick="openEditModal(${JSON.stringify(p)})">Editar</button>
                <button onclick="removerProduto(${p.id})">Remover</button>
            `;
            container.appendChild(div);
        });
    })
    .catch(err => console.error("Erro ao listar produtos admin:", err));
}

// ==========================
//      ADICIONAR PRODUTO
// ==========================
function adicionarProduto() {
    const formData = new FormData();
    formData.append("nome", document.getElementById("nome").value);
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("preco", document.getElementById("preco").value);
    formData.append("categoria", document.getElementById("categoria-prod").value);
    const imagem = document.getElementById("imagem").files[0];
    if (imagem) formData.append("imagem", imagem);

    document.getElementById("add-msg").innerText = "Adicionando produto...";

    fetch(`${API_URL}/produtos`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // sem Content-Type para FormData
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                const msg = data.message || `Erro HTTP ${res.status}`;
                document.getElementById("add-msg").innerText = msg;
                throw new Error(msg);
            });
        }
        return res.json();
    })
    .then(data => {
        document.getElementById("add-msg").innerText = data.message;
        // Limpar campos
        document.getElementById("nome").value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("preco").value = "";
        document.getElementById("imagem").value = "";
        removeImage();
        showSection('list-products-section');
    })
    .catch(err => console.error("Erro ao adicionar produto:", err));
}

// ==========================
//      REMOVER PRODUTO
// ==========================
function removerProduto(id) {
    if (!confirm("Tem certeza que deseja remover este produto?")) return;

    fetch(`${API_URL}/produtos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                alert(data.message || `Erro HTTP ${res.status}`);
                throw new Error(data.message);
            });
        }
        return res.json();
    })
    .then(data => {
        alert(data.message);
        listarProdutosAdmin();
    })
    .catch(err => console.error("Erro ao remover produto:", err));
}

// ==========================
//      PREVIEW DE IMAGEM
// ==========================
function previewImage() {
    const input = document.getElementById("imagem");
    const previewContainer = document.getElementById("image-preview-container");
    const previewImg = document.getElementById("image-preview");

    if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
            previewImg.src = reader.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else removeImage();
}

function removeImage() {
    document.getElementById("imagem").value = "";
    const previewContainer = document.getElementById("image-preview-container");
    const previewImg = document.getElementById("image-preview");
    previewImg.src = "";
    previewContainer.style.display = 'none';
}

// ==========================
//      MODAL DE EDIÇÃO
// ==========================
function openEditModal(produto) {
    document.getElementById('edit-id').value = produto.id;
    document.getElementById('edit-nome').value = produto.nome;
    document.getElementById('edit-descricao').value = produto.descricao;
    document.getElementById('edit-preco').value = produto.preco;
    document.getElementById('edit-categoria').value = produto.categoria;
    document.getElementById('current-image').src = produto.imagem ? `${API_URL}/uploads/${produto.imagem}` : 'https://via.placeholder.com/150';
    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-msg').textContent = '';
}

function previewEditImage() {
    const input = document.getElementById("edit-imagem");
    const previewImg = document.getElementById("current-image");

    if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => previewImg.src = reader.result;
        reader.readAsDataURL(input.files[0]);
    }
}

function salvarEdicao() {
    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('edit-nome').value;
    const descricao = document.getElementById('edit-descricao').value;
    const preco = document.getElementById('edit-preco').value;
    const categoria = document.getElementById('edit-categoria').value;
    const novaImagem = document.getElementById('edit-imagem').files[0];
    const editMsg = document.getElementById('edit-msg');

    if (!nome || !descricao || !preco) {
        editMsg.textContent = 'Preencha todos os campos obrigatórios.';
        return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", preco);
    formData.append("categoria", categoria);
    if (novaImagem) formData.append("imagem", novaImagem);

    fetch(`${API_URL}/produtos/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                editMsg.textContent = data.message || `Erro HTTP ${res.status}`;
                throw new Error(editMsg.textContent);
            });
        }
        return res.json();
    })
    .then(data => {
        editMsg.textContent = 'Produto atualizado com sucesso!';
        listarProdutosAdmin();
        setTimeout(closeEditModal, 1500);
    })
    .catch(err => console.error("Erro ao editar produto:", err));
}
