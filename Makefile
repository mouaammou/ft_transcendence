COMPOSE_FILE = docker-compose.yml

.PHONY: all
all: build up

.PHONY: build
build:
	docker compose -f $(COMPOSE_FILE) build


.PHONY: up
up:
	docker compose -f $(COMPOSE_FILE) up -d --build


.PHONY: down
down:
	docker compose -f $(COMPOSE_FILE) down


.PHONY: clean
clean:
	docker compose -f $(COMPOSE_FILE) down -v --rmi all

.PHONY: logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

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

