/// <reference types="cypress" />

// Getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe("todos", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("can add new todo items", () => {
    const description = "A todo note description";

    // Best practices for selecting elements:
    // https://on.cypress.io/selecting-elements
    cy.get("[data-test=set-description]").type(description);
    cy.get("[data-test=create-todo]").click();

    cy.get("[data-test=reload-todos]").click();

    cy.get("[data-test=todo-list] li").last().contains(description);
  });
});
