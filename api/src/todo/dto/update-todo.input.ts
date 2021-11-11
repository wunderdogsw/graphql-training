import { CreateTodoInput } from './create-todo.input';
import { InputType, Field, Int, PickType } from '@nestjs/graphql';

@InputType()
export class UpdateTodoInput extends PickType(CreateTodoInput, [
  'description',
]) {
  @Field(() => Int!)
  id: number;
}
