.PHONY: help up down logs restart clean backup restore status init

help:
	@echo "DrawDay Backend Management Commands"
	@echo ""
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - View logs (follow mode)"
	@echo "  make restart   - Restart all services"
	@echo "  make status    - Check service status"
	@echo "  make clean     - Stop and remove all data (CAUTION!)"
	@echo "  make backup    - Backup database"
	@echo "  make restore   - Restore database from backup.sql"
	@echo "  make init      - Initial setup (copy .env, start services)"

up:
	docker-compose up -d
	@echo "✅ Backend started at http://localhost:8055"

down:
	docker-compose down
	@echo "✅ Backend stopped"

logs:
	docker-compose logs -f

restart:
	docker-compose restart
	@echo "✅ Backend restarted"

status:
	docker-compose ps

clean:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose down -v
	rm -rf database/* uploads/*
	@echo "✅ All data removed"

backup:
	@mkdir -p backups
	docker-compose exec database pg_dump -U drawday_user drawday_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backed up to backups/"

restore:
	@if [ ! -f backup.sql ]; then echo "❌ backup.sql not found"; exit 1; fi
	docker-compose exec -T database psql -U drawday_user drawday_db < backup.sql
	@echo "✅ Database restored from backup.sql"

init:
	@if [ ! -f .env ]; then cp .env.example .env && echo "✅ Created .env file - please update with secure values"; fi
	@echo "Starting services..."
	@make up
	@sleep 5
	@echo ""
	@echo "🎉 Backend initialized!"
	@echo "📍 Admin Panel: http://localhost:8055"
	@echo "📧 Default Admin: admin@drawday.app"
	@echo "🔑 Default Password: drawday"
	@echo ""
	@echo "⚠️  Remember to change the admin password and update .env with secure keys!"