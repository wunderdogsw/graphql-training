---
marp: true
theme: default
class: invert
size: 16:9
---

# Working with NestJS and ApolloClient for a seamless GraphQL and TypeScript development experience

During this course we will briefly go through these subjects:

- set up code-first GraphQL API with NestJS and TypeORM and PostgreSQL
- set up GraphQL web client using create-react-app and ApolloClient
- tie everything together with Docker, docker-compose and graphql-code-generator for a seamless local development experience

In the end we will have everything set up in such a way that code-changes in the backend will automatically update types and hooks used by the frontend components. This will make the development experience between frontend and backend development seamless and easy.

---

# Why GraphQL?

- TODO

# Why not GraphQL

- TODO

---

# Prerequisites

Tools used:

- Docker
- a terminal
- a text editor (or IDE)
- a browser

Make sure you have these installed and configured before starting the course.

---

Knowledge of the following subjects is beneficial, although not required:

- Node
- React
- TypeScript
- yarn (feel free to use npm+npx instead)
- NestJS (this will be used to get us started quickly and avoid dealing with Express)
- TypeORM (this will be used to avoid dealing with SQL)

The main focus will be on these:

- GraphQL
- ApolloClient

---

# How this course works

- each step in this course is documented as a separate commit that can be accessed by viewing the associated pull request:
  - [API][api]
  - [CLIENT][client]
- the slides will go through each step and present how some the code changes can be created with command line tools
- some slides will contain a context quote to help keep tract the expected state of the terminal:

> Context: `/graphql-training/api && yarn start`

[api]: https://github.com/wunderdogsw/graphql-training/pull/1/commits
[client]: https://github.com/wunderdogsw/graphql-training/pull/2/commits

---
# API

## Install Nest and create simple API

Install [NestJS CLI][nestjscli] globally

```plaintext
yarn global add @nestjs/cli
```

[nestjscli]: [https://docs.nestjs.com/cli/overview]

Initialise the project and create the API

```plaintext
mkdir graphql-training
cd graphql-training
git init
```

- Choose `yarn` in the following step: 

```plaintext
nest new api
```


---

## Start the API

> Context: `/graphql-training/api`

```plaintext
yarn start:dev
```

Open browser at http://localhost:3000 

---

## Create simple GraphQL API

> Context: `/graphql-training/api`

Add GraphQL to the API

```plaintext
yarn add @nestjs/graphql apollo-server-express graphql-tools graphql
```

Add resources related to a todo entity:

```plaintext
nest generate resource todo
```
- Choose `GraphQL (code first)`
- Choose `Y` for CRUD

---

## Configure GraphQL in NestJS (code-first)

Modify `/graphql-training/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TodoModule } from './todo/todo.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      playground: true,
    }),
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## First GraphQL query

> Context: `/graphql-training/api && yarn start:dev`

Open browser to access playground: http://localhost:3000/graphql

```graphql
query {
  todo(id: 1) {
    exampleField
  }
}
```

This will result in an error, since the default resolver is not ready (and also there is no data).

---

## Fix resolver and implement service

> Context: `/graphql-training/api && yarn start:dev`

Make changes:
- `/src/todo/dto/create-todo.input.ts`
- `/src/todo/dto/update-todo.input.ts`
- `/src/todo/entities/todo.entity.ts`
- `/src/todo/todo.resolver.ts`
- `/src/todo/todo.service.ts`

Observe that:
-  `/src/schema.graphql` is automatically updated (code first configuration)
- the documentation is available in the playground

See commit: [API: Update todo models and service to return sane results][1]

[1]: https://github.com/wunderdogsw/graphql-training/pull/1/commits/5e40ee33c0b744726aef6163670c54720ca43bcc



---

Create mutation:

> Context: `/graphql-training/api && yarn start:dev`

```graphql
mutation {
  createTodo(createTodoInput: {
    description: "Create todo"
  }) {
    id
    description
  }
}
```

- observe when trying to input something bad => GRAPHQL_VALIDATION_FAILED!

---

> Context: `/graphql-training/api && yarn start:dev`

Query all: 

```graphql
query {
  todos {
    id 
    description
  }
}
```

---

## Add Docker

Add `/graphql-training/api/Dockerfile`:

```docker
FROM node:14-alpine as builder
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --only=development
COPY . .
RUN yarn build
```

---

Add `/graphql-training/docker-compose.yml`:

```yaml
version: '3.7'
services:
  api:
    build:
      context: ./api
      target: builder
    command: yarn start:dev
    restart: on-failure
    volumes:
      - ./api:/usr/src/app
    ports:
      - '8000:8000'

```

---

Change port in `/graphql-training/api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
bootstrap();
```

> Context: `/graphql-training`

```plaintext
docker-compose up
docker-compose up -d
docker-compose logs api
docker-compose down
```

---

## Add TypeORM and PostgreSQL database

> Context: `/graphql-training/api`

```plaintext
yarn add @nestjs/typeorm typeorm pg
```

---

TypeORM requires some changes to tsconfig.json (esModuleInterop and moduleResolution):
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

---

### Add PostgreSQL database: Add ORM configuration

Add `/graphql-training/api/ormconfig.ts`:

```typescript
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: true,
  logging: false,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '**', '*.migration.{ts,js}')],
  subscribers: [join(__dirname, '**', '*.subscriber.{ts,js}')],
};

export default config;
```

---

### Add PostgreSQL database: Add docker configuration for db

Update: `/graphql-training/docker-compose.yml`:

```yaml
version: '3.7'
services:
  api:
    build:
      context: ./api
      target: builder
    command: yarn start:dev
    restart: on-failure
    environment:
      POSTGRES_HOST: db
      POSTGRES_PORT: 5432
      POSTGRES_DB: postgresdb
      POSTGRES_USER: root
      POSTGRES_PASSWORD: onlyfordev
    volumes:
      - ./api:/usr/src/app
    ports:
      - '8000:8000'
  db:
    image: postgres:13-alpine
    restart: always
    environment:
      POSTGRES_DB: postgresdb
      POSTGRES_USER: root
      POSTGRES_PASSWORD: onlyfordev
    volumes:
      - ./data/sql-data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
```
---

## Use db to store todo items permanently


> Context: `/graphql-training/api/src`

Make changes:
- `/app.module.ts`: add TypeORM configuration
- `/todo/entities/todo.entity.ts`: add TypeORM decorators
- `/todo/todo.module.ts`: Todo configuration
  - this enables using `@InjectRepository(Todo)`
- `/todo/todo.resolver.ts`
- `/todo/todo.service.ts`: Use `Repository<Todo>` to communicate with db

See commit [API: Use db to store todo items][9]

[9]: https://github.com/wunderdogsw/graphql-training/pull/1/commits/601b579fc840bbd2043cbc5954b372797481b96e

---

# Client

> Context: `/graphql-training`

```plaintext
yarn create react-app web --template typescript
cd web
yarn start
```

- clean up generated code at will
---

## Dockerise

Add `/graphql-training/web/Dockerfile` (can be improved, but his will suffice for now)

```plaintext
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
```

Update `/graphql-training/docker-compose.yml`

```yaml
version: '3.7'
services:
  web:
    build: ./web
    command: yarn start
    restart: on-failure
    environment:
      REACT_APP_LOCAL: local
    volumes:
      - ./web:/usr/src/app
    ports:
      - '3000:3000'
    depends_on:
      - api
  api:
    ...
  db:
    ...
```
---

## Install GraphQL and Apollo Client

> Context: `/graphql-training/web`

```plaintext
yarn add graphql @apollo/client
```

Create `/graphql-training/web/src/client.ts`

```typescript
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "http://localhost:8000/graphql",
  cache: new InMemoryCache(),
});
```

---
Create `/graphql-training/web/src/components/Todo/Todo.tsx`

```typescript
import React from 'react';
import { useQuery, gql } from '@apollo/client';

type TodoItem = {
  id: number;
  description: string;
};

type Data = {
  todos: TodoItem[];
};

const TODO_QUERY = gql`
  query {
    todos {
      id
      description
    }
  }
`;

const Todo: React.FC = () => {
  const { loading, error, data } = useQuery<Data>(TODO_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error || !data?.todos) return <p>Error!</p>;

  return (
    <ul>
      {data.todos.map(({ id, description }) => (
        <li key={id}>
          Item {id}: {description}
        </li>
      ))}
    </ul>
  );
};

export default Todo;

```
---

Change `/graphql-training/web/src/App.txs`:

```typescript
import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { client } from './client';
import Todo from './components/Todo/Todo';

const App: React.FC = () => (
  <ApolloProvider client={client}>
    <Todo />
  </ApolloProvider>
);

export default App;
```

---
## Install graphql-codegen and plugins

> Context: `/graphql-training/web`

```plaintext
yarn add --dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo @graphql-codegen/typescript-apollo-client-helpers

```

Add graphql-codegen configuration: `/graphql-training/web/codegen.yml`:

```yaml
overwrite: true
schema: http://localhost:8000/graphql
documents: src/operations/**/*.graphql
generates:
  src/types/generated-types-and-hooks.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
      - typescript-apollo-client-helpers
```
Move listing query to own file `/graphql-training/web/operations/todo/list.graphql`:

```graphql
query Todos {
  todos {
    id
    description
  }
}
```
---
Change `/graphql-training/web/package.json`:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "generate": "graphql-codegen",
    "generate:watch": "graphql-codegen --watch"
  }
}
```

> Context: `/graphql-training && docker-compose up -d && cd web`

```plaintext
yarn generate
```

This generates the types and hooks automatically based on what the API responds. (That's why the API must be running.) Now we can use the generated types and hooks directly in the components!

Modify `/graphql-training/web/src/components/Todo/Todo.tsx`:

```typescript
import React from 'react';
import { useTodosQuery } from '../../types/generated-types-and-hooks';

const Todo: React.FC = () => {
  const { loading, error, data } = useTodosQuery();

  if (loading) return <p>Loading...</p>;
  if (error || !data?.todos) return <p>Error!</p>;

  return (
    <ul>
      {data.todos.map(({ id, description }) => (
        <li key={id}>
          Item {id}: {description}
        </li>
      ))}
    </ul>
  );
};

export default Todo;
```
