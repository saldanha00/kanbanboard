import base64
import os
import time
from flask import Flask, request, jsonify, render_template
import mysql.connector
from createJiraIssue import create_jira_issue
import datetime

app = Flask(__name__)

# Conectar ao banco de dados MySQL
def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="jiraBoardApp",
        password="sua_senha_segura",
        database="kanbanboard"
    )
    return connection

# Rota para exibir o Kanban Board
@app.route('/')
def kanban_board():
    return render_template('index.html')

@app.route('/get-tasks', methods=['GET'])
def get_tasks():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM tasks")
        tasks = cursor.fetchall()
        return jsonify(tasks)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()


# Rota para salvar uma nova tarefa ou editar uma existente
@app.route('/save-task', methods=['POST'])
def save_task():
    data = request.json
    title = data.get('title')
    dor = data.get('dor')
    dod = data.get('dod')
    date = data.get('date')
    priority = data.get('priority')
    status = data.get('status')  # Adicionando o campo status

    # Converter a data para o formato correto
    if date:
        date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
    else:
        date = None

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Inserir ou atualizar a tarefa
        cursor.execute("""
            INSERT INTO tasks (title, dor, dod, date, priority, status, jira_created)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE dor=VALUES(dor), dod=VALUES(dod), date=VALUES(date), priority=VALUES(priority), status=VALUES(status)
        """, (title, dor, dod, date, priority, status, False))
        connection.commit()
        return jsonify({'message': 'Tarefa salva com sucesso!'})
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()


@app.route('/update-task-status', methods=['POST'])
def update_task_status():
    data = request.json
    task_id = data.get('id')
    new_status = data.get('status')

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Atualizar o status da tarefa no banco de dados
        cursor.execute("""
            UPDATE tasks SET status = %s WHERE id = %s
        """, (new_status, task_id))
        connection.commit()
        return jsonify({'message': 'Status atualizado com sucesso!'})
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()


# Rota para criar o ticket no JIRA
@app.route('/create-jira-ticket', methods=['POST'])
def create_jira_ticket():
    data = request.json
    title = data.get('title')
    dor = data.get('dor')
    dod = data.get('dod')
    priority = data.get('priority')

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Verificar se a tarefa já tem um ticket no JIRA
        cursor.execute("SELECT jira_created FROM tasks WHERE title = %s", (title,))
        result = cursor.fetchone()

        if result and result[0]:
            return jsonify({'error': 'Ticket no JIRA já foi criado para esta tarefa!'}), 400

        # Criar o ticket no JIRA
        result = create_jira_issue(title, dor, dod, priority)

        if result['status'] == 'success':
            # Atualizar o banco de dados para indicar que o ticket foi criado
            cursor.execute("UPDATE tasks SET jira_created = TRUE WHERE title = %s", (title,))
            connection.commit()
            return jsonify({'message': 'Ticket criado com sucesso no JIRA!'}), 201
        else:
            return jsonify({'error': result['message']}), 400
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()

@app.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
        connection.commit()
        return jsonify({'message': 'Tarefa excluída com sucesso!'})
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()

import os

@app.route('/add-comment', methods=['POST'])
def add_comment():
    connection = None
    cursor = None
    try:
        data = request.json
        task_id = data.get('task_id')
        comment = data.get('comment')
        image_base64 = data.get('image')

        if not task_id or not comment:
            return jsonify({'error': 'Task ID e comentário são obrigatórios!'}), 400

        # Processar a imagem, se houver
        image_path = None
        if image_base64:
            # Decodificar a imagem base64 e salvar no servidor
            image_data = base64.b64decode(image_base64.split(',')[1])
            image_filename = f"comment_{task_id}_{int(time.time())}.png"
            image_directory = os.path.join('static', 'uploads')

            # Verificar se o diretório existe e, caso contrário, criá-lo
            if not os.path.exists(image_directory):
                os.makedirs(image_directory)

            image_path = os.path.join(image_directory, image_filename)
            with open(image_path, 'wb') as f:
                f.write(image_data)

        # Inicializar a conexão e cursor
        connection = get_db_connection()
        cursor = connection.cursor()

        # Inserir o comentário no banco
        cursor.execute("""
            INSERT INTO comments (task_id, comment, image_path)
            VALUES (%s, %s, %s)
        """, (task_id, comment, image_path))
        connection.commit()

        return jsonify({'message': 'Comentário adicionado com sucesso!'})

    except Exception as e:
        # Capture e exiba o erro para depuração
        print(f"Erro no servidor: {str(e)}")
        return jsonify({'error': 'Erro ao adicionar comentário!'}), 500

    finally:
        # Verificar se o cursor e a conexão foram inicializados corretamente antes de tentar fechá-los
        if cursor:
            cursor.close()
        if connection:
            connection.close()



@app.route('/get-comments/<int:task_id>', methods=['GET'])
def get_comments(task_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Obter os comentários da tarefa
        cursor.execute("SELECT comment, image_path, created_at FROM comments WHERE task_id = %s", (task_id,))
        comments = cursor.fetchall()
        return jsonify(comments)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)})
    finally:
        cursor.close()
        connection.close()




if __name__ == '__main__':
    app.run(debug=True)
