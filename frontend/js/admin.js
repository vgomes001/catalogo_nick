let token = "";
const API_URL = "http://localhost:3000";

// LOGIN
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
        // 1. Trata a resposta HTTP antes de extrair o JSON
        if (!res.ok) {
            // Se o status for ruim (400, 401, 500), tenta extrair a mensagem de erro do backend
            return res.json().then(data => {
                const message = data.message || `Erro de rede/servidor (${res.status})`;
                document.getElementById("login-msg").innerText = message;
                // Lança um erro para pular o próximo .then()
                throw new Error(message); 
            });
        }
        // Se a resposta for OK (200), prossegue
        return res.json();
    })
    .then(data => {
        // Sucesso no login
        token = data.token;
        document.getElementById("login-msg").innerText = "Login bem-sucedido!";
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";
        listarProdutosAdmin();
    })
    .catch(err => {
        // Erros de rede (fetch failed) ou erros lançados acima
        if (err.message && !document.getElementById("login-msg").innerText.includes("Erro")) {
             document.getElementById("login-msg").innerText = err.message;
        } else if (!err.message) {
            document.getElementById("login-msg").innerText = "Falha ao conectar ao servidor.";
        }
        console.error("Erro no login:", err);
    });
}

// LISTAR PRODUTOS PARA ADMIN
function listarProdutosAdmin() {
    fetch(`${API_URL}/produtos`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("produtos-admin");
        container.innerHTML = "";
        
        // Verifica se a resposta contém uma mensagem de erro (caso o token expire)
        if (data.message && data.message.includes("Token")) {
             container.innerHTML = `<p style="color:red;">Sessão expirada ou não autorizado. Por favor, faça login novamente.</p>`;
             console.error("Sessão expirada.");
             // Poderia forçar o logout aqui se quisesse
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
                <button onclick="removerProduto(${p.id})">Remover</button>
            `;
            container.appendChild(div);
        });
    })
    .catch(err => console.error("Erro ao listar produtos admin:", err));
}

// ADICIONAR PRODUTO
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
        // Ao enviar FormData, o Content-Type não é definido manualmente
        headers: { "Authorization": `Bearer ${token}` }, 
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                const message = data.message || `Erro ao adicionar (${res.status})`;
                document.getElementById("add-msg").innerText = message;
                // Lança um erro para ser capturado no catch
                throw new Error(message); 
            });
        }
        return res.json();
    })
    .then(data => {
        // Sucesso
        document.getElementById("add-msg").innerText = data.message;
        
        // Limpa os campos
        document.getElementById("nome").value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("preco").value = "";
        document.getElementById("imagem").value = "";
        
        listarProdutosAdmin();
    })
    .catch(err => {
        // Erro já foi exibido, apenas loga no console
        console.error("Erro ao adicionar produto:", err);
    });
}

// REMOVER PRODUTO
function removerProduto(id) {
    if (!confirm("Tem certeza que deseja remover este produto?")) return;

    fetch(`${API_URL}/produtos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                alert(data.message || `Erro ao remover: ${res.status}`);
                throw new Error(data.message || `Erro HTTP ${res.status}`);
            });
        }
        return res.json();
    })
    .then(data => {
        alert(data.message);
        listarProdutosAdmin();
    })
    .catch(err => console.error("Erro ao remover:", err));
}

function previewImage(event) {
    const reader = new FileReader();
    const inputImagem = document.getElementById("imagem");
    const previewContainer = document.getElementById("image-preview-container");
    const previewImageElement = document.getElementById("image-preview");

    if (inputImagem.files.length > 0) {
        // Define o que acontece quando o leitor termina de carregar
        reader.onload = function(){
            previewImageElement.src = reader.result;
            previewContainer.style.display = 'block'; // Exibe o container
        };
        
        // Lê o arquivo como uma URL de dados (base64)
        reader.readAsDataURL(inputImagem.files[0]);
    } else {
        removeImage(); // Caso a seleção seja cancelada
    }
}

function removeImage() {
    const inputImagem = document.getElementById("imagem");
    const previewContainer = document.getElementById("image-preview-container");
    const previewImageElement = document.getElementById("image-preview");

    // Limpa o valor do input file (importante para o FormData não enviar nada)
    inputImagem.value = ""; 

    // Oculta e limpa a pré-visualização
    previewImageElement.src = "";
    previewContainer.style.display = 'none'; 
}

