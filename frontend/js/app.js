const API_URL = "http://localhost:3000";

function listarProdutos() {
    const categoria = document.getElementById("categoria").value;
    let url = `${API_URL}/produtos`;
    if (categoria) url += `?categoria=${categoria}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("produtos");
            container.innerHTML = "";

            data.forEach(p => {
                const div = document.createElement("div");
                div.classList.add("produto");
                div.innerHTML = `
                    <img src="${p.imagem ? `${API_URL}/uploads/${p.imagem}` : 'https://via.placeholder.com/150'}" alt="${p.nome}">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao}</p>
                    <p>R$ ${p.preco}</p>
                    <p>Categoria: ${p.categoria}</p>
                `;
                container.appendChild(div);
            });
        });
}

// Listar produtos ao carregar a página
listarProdutos();
