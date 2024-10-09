function deleteTask() {
    // Obter o ID da tarefa a partir do campo oculto
    const taskId = document.getElementById("taskId").value;

    if (!taskId) {
        alert("Erro: Não foi possível identificar a tarefa para exclusão.");
        return;
    }

    // Confirmar a exclusão com o usuário
    if (!confirm("Você tem certeza que deseja excluir esta tarefa?")) {
        return;
    }

    // Enviar a solicitação de exclusão para o backend usando o ID
    fetch(`/delete-task/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Erro ao excluir tarefa: ' + data.error);
        } else {
            alert('Tarefa excluída com sucesso!');
            closePopup();  // Fecha o pop-up após excluir
            refreshBoard();  // Atualiza o board
        }
    })
    .catch(error => {
        console.error('Erro ao excluir tarefa:', error);
    });
    window.location.reload();

}
