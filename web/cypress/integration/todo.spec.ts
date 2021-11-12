/// <reference types="cypress" />

// Getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe("todos", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  const createTodo = (description: string) => {
    // Best practices for selecting elements:
    // https://on.cypress.io/selecting-elements
    cy.selectItem("set-description").type(description);
    cy.selectItem("create-todo").click();

    cy.selectItem("reload-todos").click();

    cy.selectItem("todo-list").get("li").last().contains(description);
  };

  it("can add new todo items", () => {
    const description = "A todo note description";

    createTodo(description);
  });

  it("can add new todo items and also reset state", () => {
    const description = "A todo note description";

    createTodo(description);

    cy.selectItem("set-description").should("have.value", "");
  });
});
