setup:
	@script/setup
.PHONY: setup

lint:
	@script/lint
.PHONY: lint

build:
	@docker-compose build --force-rm bot
.PHONY: build

start:
	@docker-compose up bot
.PHONY: start

console:
	@docker-compose exec bot /bin/bash
.PHONY: console

teardown:
	@docker-compose down --volumes --remove-orphans --rmi local
.PHONY: teardown
