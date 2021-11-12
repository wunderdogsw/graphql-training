---
marp: true
theme: default
class: invert
size: 16:9
---

# Working with NestJS and ApolloClient for a seamless GraphQL and TypeScript development experience

---

During this course we will briefly go through these subjects:

- set up code-first GraphQL API with NestJS and TypeORM and PostgreSQL
- set up GraphQL web client using create-react-app and ApolloClient
- tie everything together with Docker, docker-compose and graphql-code-generator for a seamless local development experience

In the end we will have everything set up in such a way that code-changes in the backend will automatically update types and hooks used by the frontend components. This will make the development experience between frontend and backend development seamless and easy.

---

## Benefits of GraphQL with ApolloClient, NestJS and TypeORM

- Improved development experience:
  - automatic type and hook generation for frontend based on backend types
  - built-in query/input validation errors for API
  - built-in documentation for API
- designed from the start to serve clients with different needs: no more custom REST-like APIs for doing complex queries to the database

---

## Disadvantages

- REST is industry standard and might be required by external APIs
- HTTP caching is harder to implement since all queries are POST by default
  - Mitigation: Configure Apollo to use GET queries
- Possible N + 1 query problems when serving relational data
- ???

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

> Context: `/graphql-training && docker-compose up -d`

[api]: https://github.com/wunderdogsw/graphql-training/pull/1/commits
[client]: https://github.com/wunderdogsw/graphql-training/pull/2/commits

---

# Preassignment

---

## Install Nest

Install [NestJS CLI][nestjscli] globally

```plaintext
yarn global add @nestjs/cli
```

[nestjscli]: [https://docs.nestjs.com/cli/overview]

Clone the repo and checkout code in the `starter` branch:

```plaintext
git clone https://github.com/wunderdogsw/graphql-training.git
cd graphql-training
git checkout starter
git checkout -b local
```

---

Create an API using [NestJS][nestjs]:

```plaintext
nest new api --package-manager yarn
```

Create a web app using [CRA][cra]:

```plaintext
yarn create react-app web --template typescript
```

---

Use the configuration provided in `docker-compose.yml` to start the API, the web app and the DB:

```plaintext
docker-compose up -d
```

[nestjs]: https://docs.nestjs.com/
[cra]: https://create-react-app.dev/docs/getting-started/

Check that the API works at http://localhost:8000

Check that the web app works at http://localhost:3000

Feel free to also check that the DB works at http://localhost:5432

Troubleshooting and shutdown:

```plaintext
docker ps
docker-compose logs api
docker-compose logs web
docker-compose logs db
docker-compose down
```

---

# API

> Context: `/graphql-training && docker-compose up -d`

Check that the API works at http://localhost:8000

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
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { TodoModule } from "./todo/todo.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), "src/schema.graphql"),
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

> Context: `/graphql-training && docker-compose up -d`

Open browser to access playground: http://localhost:8000/graphql

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

> Context: `/graphql-training && docker-compose up -d`

Make changes:

- `/src/todo/dto/create-todo.input.ts`
- `/src/todo/dto/update-todo.input.ts`
- `/src/todo/entities/todo.entity.ts`
- `/src/todo/todo.resolver.ts`
- `/src/todo/todo.service.ts`

Observe that:

- `/src/schema.graphql` is automatically updated (code first configuration)
- the documentation is available in the playground

See commit: [API: Update todo models and service to return sane results][1]

[1]: https://github.com/wunderdogsw/graphql-training/pull/1/commits/5e40ee33c0b744726aef6163670c54720ca43bcc

---

### Test that GraphQL API works

> Context: `/graphql-training && docker-compose up -d`

Create mutation:

```graphql
mutation {
  createTodo(createTodoInput: { description: "Create todo" }) {
    id
    description
  }
}
```

- observe when trying to input something bad => GRAPHQL_VALIDATION_FAILED!

---

> Context: `/graphql-training && docker-compose up -d`

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

## Add TypeORM and PostgreSQL database

> Context: `/graphql-training/api`

```plaintext
yarn add @nestjs/typeorm typeorm pg
```

TypeORM requires some changes to `/graphql-training/api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "Leave other options": "as they were",
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

---

### Add PostgreSQL database: Add ORM configuration

Add `/graphql-training/api/ormconfig.ts`:

```typescript
import { join } from "path";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const config: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: true,
  logging: false,
  entities: [join(__dirname, "**", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "**", "*.migration.{ts,js}")],
  subscribers: [join(__dirname, "**", "*.subscriber.{ts,js}")],
};

export default config;
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

Feel free to check data in DB to check that everything is configured properly at this stage. See `/graphql-training/docker-compose.yml` for details on DB configuration.

---

# Client

> Context: `/graphql-training && docker-compose up -d`

Check that the web app works at http://localhost:3000

- clean up generated code at will

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
import React from "react";
import { useQuery, gql } from "@apollo/client";

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

Change `/graphql-training/web/src/App.tsx`:

```typescript
import { ApolloProvider } from "@apollo/client";
import React from "react";
import { client } from "./client";
import Todo from "./components/Todo/Todo";

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

---

Create `/graphql-training/web/src/operations/todo/list.graphql` for listing query:

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
  "Leave other options": "as they were",
  "scripts": {
    "Leave other scripts": "as they were",
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

---

Modify `/graphql-training/web/src/components/Todo/Todo.tsx`:

```typescript
import React from "react";
import { useTodosQuery } from "../../types/generated-types-and-hooks";

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

---

## Add monorepo magic

The last, definitely optional, step that we will take to [improve the development flow][devflow] is to automatically update the frontend types when the backend types change.

[devflow]: https://graphql-code-generator.com/docs/getting-started/development-workflow

Modify the schema in `/graphql-training/web/codegen.yml`:

```yaml
schema: ../api/src/schema.graphql
```

---

> Context: `/graphql-training/web && docker-compose down`

```plaintext
yarn add --dev concurrently
```

Change `/graphql-training/web/package.json`:

```json
{
  "Leave other options": "as they were",
  "scripts": {
    "start": "concurrently \"yarn generate:watch\" \"react-scripts start\"",
    "Leave other scripts": "as they were"
  }
}
```

---

Make sure `graphql-codegen` can access the API schema by changing `/graphql-training/docker-compose.yml`:

```yaml
services:
  // Leave other options as they were
  web:
    // Leave other options as they were
    volumes:
      - ./web:/usr/src/app
      - ./api/src/schema.graphql:/usr/src/api/src/schema.graphql
```

---

# Final assignment

---

> Context: `/graphql-training && docker-compose up`

1. Make changes to `/graphql-training/api/src/todo/entities/todo.entity.ts` and save them.

2. First nest will trigger a new build and the autoSchemaFile configuration in `/graphql-training/api/src/app.module.ts` will trigger the update of the API schema `/graphql-training/api/src/schema.graphql`:

```plaintext
[10:37:03 AM] File change detected. Starting incremental compilation...
...
api_1  | [Nest] 74   - 01/18/2021, 10:37:05 AM   [NestFactory] Starting Nest application...
...
api_1  | [Nest] 74   - 01/18/2021, 10:37:05 AM   [NestApplication] Nest application successfully started +161ms
```

---

3. Next, `graphql-codegen` will trigger from the API schema update and generate new types and hooks for the frontend:

```plaintext
web_1  | [0] [10:37:07] Parse configuration [started]
...
web_1  | [0] [10:37:07] Generate src/types/generated-types-and-hooks.ts [completed]
...
web_1  | [1] Compiled successfully!
```

Congratulations! You have just implemented an API and a client that have types synced. Additionally the API provides validation out of the box and is well documented.

---

# Cypress testing

---

## Install Cypress

Prerequisites: https://docs.cypress.io/guides/getting-started/installing-cypress

> Context: `/graphql-training/web`

Install Cypress

```plaintext
yarn add --dev cypress
```

---

## Configure Cypress

Configure Cypress and run it locally

```plaintext
yarn run cypress open
```

This will create the following folders with some default contents

```plaintext
/cypress/fixtures
/cypress/integration
/cypress/plugins
/cypress/support
```

and then opens a browser window that lets you run the new default tests.

---

## Configure Typescript

New versions of Cypress ship with Typescript built in.

All you need to do is:

- change filenames from `*.js` to `*.ts`
- add custom command interfaces to Cypress namespace

For example `/web/cypress/support/commands.ts`:

```typescript
declare namespace Cypress {
  interface Chainable<Subject> {
    selectItem(selector: string): Chainable<Subject>;
  }
}

Cypress.Commands.add("selectItem", (selector, ...args) =>
  cy.get(`[data-test=${selector}]`, ...args)
);
```

---

# Bonus: Using Marp to create slides

---

> Context: `/graphql-training`

```plaintext
mkdir slides
cd slides
yarn init
yarn add --dev @marp-team/marp-cli
```

Modify `/graphql-training/slides/package.json`:

```json
{
  "Leave other options": "as they were",
  "scripts": {
    "slides": "marp '../README.md' -o slides.html",
    "slides:watch": "marp '../README.md' -o slides.html --watch"
  }
}
```

---

Add the following in the beginning of `/graphql-training/README.md`:

```plaintext
---
marp: true
theme: default
class: invert
---
```

> Context: `/graphql-training/slides`

```plaintext
yarn slides
```
