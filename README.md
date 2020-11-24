# Фронт-енд проекта debt-manager
## Запуск:
0. Установить переменные окружения в файле .env  
VUE_APP_BACKEND_URL = URL backend'а  
VUE_APP_CLIENT_ID = ClientId для бекенда  
VUE_APP_CLIENT_SECRET = Client secret для бекенда  
SITE_KEY= Ключ гугл капчи
0. Собрать контейнер  
`docker build -t debt_manager_frontend .`
0. Запустить контейнер  
`docker run -p 80:80 --restart always --log-opt max-size=10m --log-opt max-file=3 --name debt_manager_frontend-1 debt_manager_frontend`