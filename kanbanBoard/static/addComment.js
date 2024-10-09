// Função para adicionar imagens copiadas do clipboard
document.getElementById('newComment').addEventListener('paste', function (event) {
    const clipboardItems = event.clipboardData.items;
    for (let item of clipboardItems) {
        if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                document.getElementById('comments-section').appendChild(img);
            };
            reader.readAsDataURL(blob);
        }
    }
});

function loadComments(taskId) {
    fetch(`/get-comments/${taskId}`)
    .then(response => response.json())
    .then(comments => {
        const commentSection = document.getElementById('comments-section');
        commentSection.innerHTML = '';  // Limpar seção de comentários
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `<p>${comment.comment}</p>`;
            if (comment.image_path) {
                const img = document.createElement('img');
                img.src = `/static/uploads/${comment.image_path}`;
                commentDiv.appendChild(img);
            }
            commentSection.appendChild(commentDiv);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar comentários:', error);
    });
}

function addComment() {
    const taskId = document.getElementById('taskId').value; // ID da tarefa
    const newComment = document.getElementById('newComment').value;
    const commentSection = document.getElementById('comments-section');

    // Verificar se há uma imagem copiada (via clipboard)
    const imageElement = commentSection.querySelector('img'); 
    let imageBase64 = null;
    if (imageElement) {
        imageBase64 = imageElement.src; // Obter a imagem em base64
    }

    if (newComment.trim() === "" && !imageBase64) {
        alert("O comentário não pode estar vazio.");
        return;
    }

    // Enviar os dados ao servidor
    fetch('/add-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            task_id: taskId,
            comment: newComment,
            image: imageBase64,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Erro ao adicionar comentário: ' + data.error);
        } else {
            alert('Comentário adicionado com sucesso!');
            // Atualizar a exibição do comentário na tela
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `<p>${newComment}</p>`;
            if (imageBase64) {
                const img = document.createElement('img');
                img.src = imageBase64;
                commentDiv.appendChild(img);
            }
            commentSection.appendChild(commentDiv);
            document.getElementById('newComment').value = ''; // Limpar campo de comentário
        }
    })
    .catch(error => {
        console.error('Erro ao adicionar comentário:', error);
    });
}
