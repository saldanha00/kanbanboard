

let taskId = 0;
let editingTask = null;

// Função para carregar todas as tarefas do banco de dados e exibir no board
function loadTasks() {
    fetch('/get-tasks', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(tasks => {
        // clearBoard(); // Limpa o board antes de recarregar as tarefas
        tasks.forEach(task => {
            displayTask(task);
            loadComments(task)
        });
        updateTaskCounters(); // Atualiza os contadores 
    })
    .catch(error => {
        console.error('Erro ao carregar tarefas:', error);
    });
}

// Função para exibir uma tarefa no board
function displayTask(task) {
    console.log("Exibindo tarefa: ", task); // Verificar a tarefa recebida

    let taskElement = document.createElement("div");
    taskElement.classList.add("item");
    taskElement.id = `task${task.id}`;
    taskElement.draggable = true;
    taskElement.ondragstart = drag;  // Certifique-se de que a função `drag` foi definida
    taskElement.ondblclick = () => openPopup(task);

    // Adiciona o conteúdo da tarefa (somente título e prioridade)
    taskElement.innerHTML = `<strong>${task.title}</strong><br>
        <em>Prioridade:</em> ${task.priority}`;

    // Armazenar os dados da tarefa como atributos para edição futura
    taskElement.dataset.title = task.title;
    taskElement.dataset.dor = task.dor;
    taskElement.dataset.dod = task.dod;
    taskElement.dataset.date = task.date;
    taskElement.dataset.priority = task.priority;

    // Verifique qual coluna a tarefa deve ir
    if (task.status === "done") {
        document.getElementById("done").appendChild(taskElement);  // Exemplo para coluna Done
    } else if (task.status === "todo") {
        document.getElementById("todo").appendChild(taskElement);  // Exemplo para coluna To-Do
    } else {
        document.getElementById("backlog").appendChild(taskElement);  // Exemplo para coluna Backlog
    }
}

// Função para permitir o evento "drop"
function allowDrop(event) {
    event.preventDefault();
}

// Função para capturar o elemento que está sendo arrastado
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

// Função para soltar o elemento na nova coluna e atualizar o status da tarefa
function drop(event, newStatus) {
    event.preventDefault();
    var taskId = event.dataTransfer.getData("text");
    var taskElement = document.getElementById(taskId);
    
    // Verifica se o destino é uma coluna válida para inserir o elemento
    if (event.target.classList.contains('column')) {
        event.target.appendChild(taskElement);
    }

    // Fazer a requisição para atualizar o status da tarefa
    fetch('/update-task-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: taskId.replace('task', ''), // Remove 'task' do ID para pegar apenas o número
            status: newStatus  // Passando o novo status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log(`Status da tarefa ${taskId} atualizado para ${newStatus}!`);
            updateTaskCounters();  // Atualiza os contadores
        } else {
            console.error('Erro ao atualizar o status da tarefa:', data.error);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar o status da tarefa:', error);
    });
}

// Função para atualizar os contadores
function updateTaskCounters() {
    document.getElementById("backlog-counter").innerText = document.querySelectorAll("#backlog > div").length;    ;
    document.getElementById("todo-counter").innerText = document.querySelectorAll("#todo > div").length;
    document.getElementById("done-counter").innerText = document.querySelectorAll("#done > div").length;
}

// Função de abrir e fechar o pop-up
function openPopup(task = null) {
    document.getElementById("popup").style.display = "block";
    document.getElementById("popupOverlay").style.display = "block";

    if (task) {
        // Se uma tarefa for passada, estamos editando
        document.getElementById("taskTitle").value = task.title || '';
        document.getElementById("taskDor").value = task.dor || '';
        document.getElementById("taskDod").value = task.dod || '';
        document.getElementById("taskDate").value = task.date || '';
        document.getElementById("taskPriority").value = task.priority || 'P1';

        // Limpar área de comentários antes de exibir novos
        document.getElementById("comments").value = '';

        // Carregar comentários relacionados à tarefa
        loadComments(task.id);

        // Exibir os botões necessários ao editar
        editingTask = task;
        document.getElementById("jiraButton").style.display = "block";
        document.getElementById("deleteButton").style.display = "block";
    } else {
        // Se não, estamos criando uma nova tarefa
        document.getElementById("taskTitle").value = '';
        document.getElementById("taskDor").value = '';
        document.getElementById("taskDod").value = '';
        document.getElementById("taskDate").value = '';
        document.getElementById("taskPriority").value = 'P1';

        // Limpa área de comentários
        document.getElementById("comments").value = '';

        editingTask = null;
        document.getElementById("jiraButton").style.display = "none";
        document.getElementById("deleteButton").style.display = "none";
    }
}


// Fechar o pop-up após salvar ou cancelar
function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("popupOverlay").style.display = "none";
}
