.PHONY: build run dev clean

build:
	docker-compose build

run:
	docker-compose up -d

dev:
	docker-compose up

clean:
	docker-compose down -v

logs:
	docker-compose logs -f

backend:
	cd backend && go run main.go

frontend:
	cd frontend && npm run dev