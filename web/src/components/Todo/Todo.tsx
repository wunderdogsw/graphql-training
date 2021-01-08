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
