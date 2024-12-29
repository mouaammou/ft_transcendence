COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

.PHONY: all
all: build up

.PHONY: build
build:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) build


.PHONY: up
up:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build


.PHONY: down
down:
	docker compose -f $(COMPOSE_FILE) down


.PHONY: clean
clean:
	docker compose -f $(COMPOSE_FILE) down -v --rmi all
	docker volume prune -f

.PHONY: logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

.PHONY: frontend_logs
frontend_logs:
	docker compose -f $(COMPOSE_FILE) logs -f frontend

.PHONY: backend_logs
backend_logs:
	docker compose -f $(COMPOSE_FILE) logs -f backend

.PHONY: ps
ps:
	docker compose -f $(COMPOSE_FILE) ps

.PHONY: exec
exec:
	docker compose -f $(COMPOSE_FILE) exec $$(SERVICE) $$(COMMAND)


.PHONY: prune
prune:
	docker system prune -a --volumes -f


.PHONY: all
all: build up

