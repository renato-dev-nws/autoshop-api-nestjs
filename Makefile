.PHONY: help install build start dev stop restart logs clean seed db-shell api-shell test lint format docker-rebuild

# Variáveis
DOCKER_COMPOSE := docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD := docker-compose

# Comando padrão: mostra ajuda
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║          Vehicles Shop API - Comandos Disponíveis             ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 Setup & Instalação:"
	@echo "  make install          - Instalar dependências"
	@echo "  make build            - Build da aplicação"
	@echo ""
	@echo "🚀 Docker (Desenvolvimento):"
	@echo "  make dev              - Iniciar ambiente completo (build + up)"
	@echo "  make start            - Iniciar containers (sem rebuild)"
	@echo "  make stop             - Parar containers"
	@echo "  make restart          - Reiniciar containers"
	@echo "  make logs             - Ver logs (todos os serviços)"
	@echo "  make logs-api         - Ver logs apenas da API"
	@echo "  make logs-db          - Ver logs apenas do PostgreSQL"
	@echo ""
	@echo "🌱 Banco de Dados:"
	@echo "  make seed             - Popular banco com dados iniciais"
	@echo "  make db-shell         - Acessar shell do PostgreSQL"
	@echo "  make db-reset         - Resetar banco (limpa e recria)"
	@echo ""
	@echo "🔧 Desenvolvimento:"
	@echo "  make api-shell        - Acessar shell do container da API"
	@echo "  make test             - Executar testes"
	@echo "  make test-watch       - Executar testes em watch mode"
	@echo "  make test-cov         - Executar testes com coverage"
	@echo "  make lint             - Executar linter"
	@echo "  make format           - Formatar código"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean            - Limpar containers e volumes"
	@echo "  make docker-rebuild   - Reconstruir tudo do zero"
	@echo "  make prune            - Limpar cache do Docker"
	@echo ""
	@echo "📊 Monitoramento:"
	@echo "  make ps               - Status dos containers"
	@echo "  make health           - Verificar saúde dos serviços"
	@echo ""
	@echo "🏭 Produção:"
	@echo "  make prod-build       - Build para produção"
	@echo "  make prod-up          - Subir ambiente de produção"
	@echo "  make prod-down        - Parar ambiente de produção"

# ============ Setup & Instalação ============
install:
	@echo "📦 Instalando dependências..."
	npm install

build:
	@echo "🔨 Building aplicação..."
	npm run build

# ============ Docker (Desenvolvimento) ============
dev:
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "✅ Ambiente iniciado!"
	@echo "📝 API: http://localhost:8080/api/v1"
	@echo "📚 Swagger: http://localhost:8080/swagger"
	@echo ""
	@echo "💡 Execute 'make seed' para popular o banco de dados"

start:
	@echo "▶️  Iniciando containers..."
	$(DOCKER_COMPOSE) up -d

stop:
	@echo "⏸️  Parando containers..."
	$(DOCKER_COMPOSE) down

restart:
	@echo "🔄 Reiniciando containers..."
	$(DOCKER_COMPOSE) restart

logs:
	@echo "📋 Exibindo logs (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE) logs -f

logs-api:
	@echo "📋 Exibindo logs da API (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE) logs -f api

logs-db:
	@echo "📋 Exibindo logs do PostgreSQL (Ctrl+C para sair)..."
	$(DOCKER_COMPOSE) logs -f postgres

# ============ Banco de Dados ============
seed:
	@echo "🌱 Populando banco de dados..."
	$(DOCKER_COMPOSE) exec api npm run seed
	@echo "✅ Seed concluído!"
	@echo "👤 Admin: admin@example.com / admin123"
	@echo "👤 Manager: manager@example.com / manager123"

db-shell:
	@echo "🐘 Acessando PostgreSQL..."
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d vehicles_shop

db-reset:
	@echo "⚠️  Resetando banco de dados..."
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d postgres redis
	@echo "⏳ Aguardando PostgreSQL..."
	@sleep 5
	$(DOCKER_COMPOSE) up -d api
	@echo "⏳ Aguardando API criar tabelas..."
	@sleep 5
	@echo "🌱 Executando seed..."
	$(DOCKER_COMPOSE) exec api npm run seed
	@echo "✅ Banco resetado e populado!"

# ============ Desenvolvimento ============
api-shell:
	@echo "🔧 Acessando shell da API..."
	$(DOCKER_COMPOSE) exec api sh

test:
	@echo "🧪 Executando testes..."
	npm run test

test-watch:
	@echo "🧪 Executando testes em watch mode..."
	npm run test:watch

test-cov:
	@echo "🧪 Executando testes com coverage..."
	npm run test:cov

lint:
	@echo "🔍 Executando linter..."
	npm run lint

format:
	@echo "✨ Formatando código..."
	npm run format

# ============ Limpeza ============
clean:
	@echo "🧹 Limpando containers e volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Limpeza concluída!"

docker-rebuild:
	@echo "🔨 Reconstruindo tudo do zero..."
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d
	@echo "⏳ Aguardando serviços..."
	@sleep 10
	$(DOCKER_COMPOSE) exec api npm run seed
	@echo "✅ Rebuild completo!"

prune:
	@echo "🧹 Limpando cache do Docker..."
	docker system prune -f
	@echo "✅ Cache limpo!"

# ============ Monitoramento ============
ps:
	@echo "📊 Status dos containers:"
	$(DOCKER_COMPOSE) ps

health:
	@echo "🏥 Verificando saúde dos serviços..."
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "🔗 Testando endpoints:"
	@curl -s http://localhost:8080/swagger > /dev/null && echo "✅ Swagger: OK" || echo "❌ Swagger: Falhou"
	@curl -s http://localhost:5432 > /dev/null 2>&1 && echo "✅ PostgreSQL: Porta aberta" || echo "❌ PostgreSQL: Porta fechada"
	@curl -s http://localhost:6379 > /dev/null 2>&1 && echo "✅ Redis: Porta aberta" || echo "❌ Redis: Porta fechada"

# ============ Produção ============
prod-build:
	@echo "🏭 Building para produção..."
	$(DOCKER_COMPOSE_PROD) build

prod-up:
	@echo "🚀 Iniciando produção..."
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "✅ Ambiente de produção iniciado!"

prod-down:
	@echo "⏹️  Parando produção..."
	$(DOCKER_COMPOSE_PROD) down
