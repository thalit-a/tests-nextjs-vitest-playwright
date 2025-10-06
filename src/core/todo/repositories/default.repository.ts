import { drizzleDatabase } from "@/db/drizzle";
import { DrizzleTodoRepository } from "./src/core/todo/repositories/drizzle-todo.repository";
import { TodoRepository } from "./src/core/todo/repositories/todo.contract.repository";

export const todoRepository: TodoRepository = new DrizzleTodoRepository(
  drizzleDatabase.db,
);