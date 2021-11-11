import React from "react";
import { useTodosQuery } from "../../types/generated-types-and-hooks";

const TodoList: React.FC = () => {
  const { loading, error, data, refetch } = useTodosQuery();

  if (error) return <p>{error}</p>;

  const handleReload = async () => {
    await refetch();
  };

  return (
    <div style={{ flex: 1, padding: 16 }}>
      <button onClick={handleReload}>Reload</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data?.todos.map(({ id, description }) => (
            <li key={id}>
              Item {id}: {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
