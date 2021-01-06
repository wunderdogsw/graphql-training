import { Injectable } from '@nestjs/common';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  todos: Todo[] = [];

  async create(createTodoInput: CreateTodoInput): Promise<Todo> {
    const id =
      (this.todos
        .map((t) => t.id)
        .sort((a, b) => b - a)
        .find(() => true) ?? 0) + 1;
    this.todos.push({
      ...createTodoInput,
      id,
    });
    return this.findOne(id);
  }

  async findAll(): Promise<Todo[]> {
    return this.todos;
  }

  async findOne(id: number): Promise<Todo> {
    return this.todos.find((t) => t.id === id);
  }

  async update(id: number, updateTodoInput: UpdateTodoInput): Promise<Todo> {
    const updated = await this.findOne(id);
    updated.description = updateTodoInput.description;
    return updated;
  }

  async remove(id: number): Promise<number> {
    this.todos = this.todos.filter((t) => t.id !== id);
    return id;
  }
}
