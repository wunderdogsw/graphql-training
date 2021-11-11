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
