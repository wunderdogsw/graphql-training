import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Mutation(() => Todo)
  createTodo(
    @Args('createTodoInput') createTodoInput: CreateTodoInput,
  ): Promise<Todo> {
    return this.todoService.create(createTodoInput);
  }

  @Query(() => [Todo])
  todos(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Query(() => Todo)
  todo(@Args('id', { type: () => Int }) id: number): Promise<Todo> {
    return this.todoService.findOne(id);
  }

  @Mutation(() => Todo)
  updateTodo(
    @Args('updateTodoInput') updateTodoInput: UpdateTodoInput,
  ): Promise<Todo> {
    return this.todoService.update(updateTodoInput.id, updateTodoInput);
  }

  @Mutation(() => Int)
  removeTodo(@Args('id', { type: () => Int }) id: number): Promise<number> {
    return this.todoService.remove(id);
  }
}
