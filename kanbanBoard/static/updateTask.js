function updateTaskOnBoard(title, dor, dod, date, priority) {
    console.log("atualizando tarefa no board")
    const taskElements = document.querySelectorAll('.item');
    
    // Encontrar o elemento da tarefa no board
    taskElements.forEach(taskElement => {
        if (taskElement.querySelector('strong').innerText === title) {
            // Atualizar os dados da tarefa no board
            taskElement.innerHTML = `<strong>${title}</strong><br><em>Prioridade:</em> ${priority}`;
            taskElement.dataset.dor = dor;
            taskElement.dataset.dod = dod;
            taskElement.dataset.date = date;
            taskElement.dataset.priority = priority;
        }
    });
    loadTasks();
}

