import requests
import json

# Configurações do JIRA
JIRA_URL = 'https://seu-jira.atlassian.net'  # URL do seu JIRA Cloud
JIRA_API_URL = f'{JIRA_URL}/rest/api/3/issue'
JIRA_EMAIL = 'seu-email@exemplo.com'
JIRA_API_KEY = 'sua-chave-de-api'
JIRA_PROJECT_KEY = 'PROJ'  # Substitua pelo seu código de projeto no JIRA

def create_jira_issue(title, dor, dod, priority):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {requests.auth._basic_auth_str(JIRA_EMAIL, JIRA_API_KEY)}'
    }

    issue_data = {
        "fields": {
            "project": {
                "key": JIRA_PROJECT_KEY
            },
            "summary": title,
            "description": f"Definition of Ready: {dor}\nDefinition of Done: {dod}",
            "issuetype": {
                "name": "Task"
            },
            "priority": {
                "name": priority
            }
        }
    }

    response = requests.post(JIRA_API_URL, headers=headers, data=json.dumps(issue_data))

    if response.status_code == 201:
        return {'status': 'success', 'issue_key': response.json()['key']}
    else:
        return {'status': 'error', 'message': response.text}
