import React, { useState } from "react";
import { useCreateTodoMutation } from "../../types/generated-types-and-hooks";

const AddTodo: React.FC = () => {
  const [description, setDescription] = useState("");
  const [createTodo] = useCreateTodoMutation();

  const handleAddTodo = async () => {
    await createTodo({
      variables: {
        input: { description },
      },
    });
  };

  return (
    <div style={{ flex: 1, padding: 16 }}>
      <input
        type="text"
        name="description"
        value={description}
        onChange={({ target }) => setDescription(target.value)}
      />
      <button onClick={handleAddTodo}>Add todo</button>
    </div>
  );
};

export default AddTodo;
