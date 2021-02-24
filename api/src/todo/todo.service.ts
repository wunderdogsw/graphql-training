import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly repository: Repository<Todo>,
  ) {}

  async create(createTodoInput: CreateTodoInput): Promise<Todo> {
    const todo = this.repository.create(createTodoInput);
    return await this.repository.save(todo);
  }

  async findAll(): Promise<Todo[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Todo> {
    return await this.repository.findOne(id);
  }

  async update(id: number, updateTodoInput: UpdateTodoInput): Promise<Todo> {
    const updated = await this.findOne(id);
    updated.description = updateTodoInput.description;
    return await this.repository.save(updated);
  }

  async remove(id: number): Promise<number> {
    await this.repository.delete(id);
    return id;
  }
}
