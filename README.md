# Vehicles Shop API

API REST para gestão de estoque de veículos multi-loja com NestJS, PostgreSQL e Redis.

## 🚀 Tecnologias

- **NestJS 10+** - Framework Node.js
- **TypeScript** - Linguagem (strict mode)
- **PostgreSQL 15+** - Banco de dados
- **TypeORM** - ORM
- **Redis** - Cache
- **JWT** - Autenticação
- **Swagger** - Documentação
- **Docker** - Containerização

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)

## 🐳 Executar com Docker

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Construir e iniciar containers
docker-compose up -d --build

# Ver logs
docker-compose logs -f api

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v
```

A API estará disponível em:
- **API**: http://localhost:8080/api/v1
- **Swagger**: http://localhost:8080/swagger
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar apenas PostgreSQL e Redis
docker-compose up -d postgres redis

# Executar em modo desenvolvimento
npm run start:dev

# Build
npm run build

# Executar testes
npm run test

# Cobertura de testes
npm run test:cov
```

## 📚 Documentação

Acesse a documentação Swagger em: http://localhost:8080/swagger

## 🗂️ Estrutura do Projeto

```
src/
├── auth/              # Autenticação JWT
├── vehicles/          # Gestão de veículos
├── photos/            # Upload e gestão de fotos
├── stores/            # Gestão de lojas (matriz/filial)
├── taxonomy/          # Categorias, marcas e modelos
├── users/             # Gestão de usuários
├── fipe/              # Integração com API FIPE
├── public/            # Endpoints públicos de busca
├── config/            # Configurações (DB, Redis, JWT)
└── common/            # Decorators, guards, filters
```

## 🔑 Autenticação

### Login Padrão (Seed)
```
Email: admin@example.com
Senha: admin123
```

### Criar Seed
```bash
npm run seed
```

## 🔒 Roles

- **admin**: Acesso total ao sistema
- **manager**: Acesso à própria loja e filiais

## 📖 Endpoints Principais

### Públicos (sem auth)
- `GET /api/v1/vehicles` - Buscar veículos
- `GET /api/v1/vehicles/:id` - Detalhes do veículo
- `GET /api/v1/vehicle-categories` - Listar categorias
- `GET /api/v1/brands` - Listar marcas
- `GET /api/v1/stores` - Listar lojas

### Autenticação
- `POST /api/v1/login` - Login

### Admin (requer JWT)
- `GET /api/v1/admin/vehicles` - Listar veículos (admin)
- `POST /api/v1/admin/vehicles` - Criar veículo
- `PUT /api/v1/admin/vehicles/:id` - Atualizar veículo
- `DELETE /api/v1/admin/vehicles/:id` - Deletar veículo
- `POST /api/v1/admin/vehicles/:id/photos` - Upload fotos

Ver documentação completa em [NESTJS.md](./NESTJS.md)

## 🛠️ Scripts Disponíveis

```bash
npm run start          # Iniciar
npm run start:dev      # Dev com watch
npm run start:prod     # Produção
npm run build          # Build
npm run test           # Testes
npm run test:cov       # Cobertura
npm run lint           # Linter
npm run migration:generate  # Gerar migration
npm run migration:run       # Executar migrations
npm run seed           # Popular banco
```

## 📝 License

MIT

## 👥 Autores

Vehicles Shop Team
