function saveTask() {
    const taskTitle = document.getElementById("taskTitle").value;
    const taskDor = document.getElementById("taskDor").value;
    const taskDod = document.getElementById("taskDod").value;
    const taskDate = document.getElementById("taskDate").value;
    const taskPriority = document.getElementById("taskPriority").value;


    // Validação de entrada
    if (!taskTitle || typeof taskTitle !== 'string') {
        alert("O campo título é obrigatório e deve ser uma string.\nValor passado:",taskTitle);
        return;
    }

    if (!taskDor || typeof taskDod !== 'string') {
        alert("Os campos DoR e DoD devem ser strings.");
        return;
    }

    if (taskDate && typeof taskDate !== 'object') {
        alert("O campo de data deve conter uma data válida.");
        return;
    }

    // Enviar os dados para o backend
    fetch('/save-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: taskTitle,
            dor: taskDor,
            dod: taskDod,
            date: taskDate,
            priority: taskPriority,
            status: "BACKLOG",

        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Erro: ' + data.error);
        } else {
            updateTaskOnBoard(taskTitle, taskDor, taskDod, taskDate, taskPriority);
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Erro ao salvar tarefa:', error);
    });
}
