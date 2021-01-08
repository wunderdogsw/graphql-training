import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Todo = {
  __typename?: 'Todo';
  id: Scalars['Int'];
  description: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  todos: Array<Todo>;
  todo: Todo;
};


export type QueryTodoArgs = {
  id: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createTodo: Todo;
  updateTodo: Todo;
  removeTodo: Scalars['Int'];
};


export type MutationCreateTodoArgs = {
  createTodoInput: CreateTodoInput;
};


export type MutationUpdateTodoArgs = {
  updateTodoInput: UpdateTodoInput;
};


export type MutationRemoveTodoArgs = {
  id: Scalars['Int'];
};

export type CreateTodoInput = {
  description: Scalars['String'];
};

export type UpdateTodoInput = {
  description: Scalars['String'];
  id: Scalars['Int'];
};

export type TodosQueryVariables = Exact<{ [key: string]: never; }>;


export type TodosQuery = (
  { __typename?: 'Query' }
  & { todos: Array<(
    { __typename?: 'Todo' }
    & Pick<Todo, 'id' | 'description'>
  )> }
);


export const TodosDocument = gql`
    query Todos {
  todos {
    id
    description
  }
}
    `;

/**
 * __useTodosQuery__
 *
 * To run a query within a React component, call `useTodosQuery` and pass it any options that fit your needs.
 * When your component renders, `useTodosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTodosQuery({
 *   variables: {
 *   },
 * });
 */
export function useTodosQuery(baseOptions?: Apollo.QueryHookOptions<TodosQuery, TodosQueryVariables>) {
        return Apollo.useQuery<TodosQuery, TodosQueryVariables>(TodosDocument, baseOptions);
      }
export function useTodosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TodosQuery, TodosQueryVariables>) {
          return Apollo.useLazyQuery<TodosQuery, TodosQueryVariables>(TodosDocument, baseOptions);
        }
export type TodosQueryHookResult = ReturnType<typeof useTodosQuery>;
export type TodosLazyQueryHookResult = ReturnType<typeof useTodosLazyQuery>;
export type TodosQueryResult = Apollo.QueryResult<TodosQuery, TodosQueryVariables>;
export type TodoKeySpecifier = ('id' | 'description' | TodoKeySpecifier)[];
export type TodoFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('todos' | 'todo' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	todos?: FieldPolicy<any> | FieldReadFunction<any>,
	todo?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createTodo' | 'updateTodo' | 'removeTodo' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createTodo?: FieldPolicy<any> | FieldReadFunction<any>,
	updateTodo?: FieldPolicy<any> | FieldReadFunction<any>,
	removeTodo?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	Todo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TodoKeySpecifier | (() => undefined | TodoKeySpecifier),
		fields?: TodoFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	}
};