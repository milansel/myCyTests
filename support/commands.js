// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// require("@4tw/cypress-drag-drop");

Cypress.Commands.add("getDataCy", (dataCy) => {
  return cy.get(`[data-cy='${dataCy}']`);
});

Cypress.Commands.add("login", (username, password) => {
  cy.contains("Username")
    .get('[data-placeholder="Username"]')
    .clear()
    .type(username);
  cy.contains("Password")
    .get('[data-placeholder="Password"]')
    .clear()
    .type(password);
  cy.get(".mat-button-wrapper").click();
});

Cypress.Commands.add("apiLogin", (username, password) => {
  const userCredentials = {
    logname: username,
    password: password,
  };
  cy.request("POST", "/logins", userCredentials)
    .its("body")
    .as("responseApiLogin");
});

Cypress.Commands.add("loginWithSession", (username, password) => {
  cy.session([username, password], () => {
    cy.visit(Cypress.env("rufUrl"));
    cy.contains("Username")
      .get('[data-placeholder="Username"]')
      .clear()
      .type(username);
    cy.contains("Password")
      .get('[data-placeholder="Password"]')
      .clear()
      .type(password);
    cy.get(".mat-button-wrapper").click().wait(600);
  });
});

Cypress.Commands.add("logout", () => {
  cy.get("sb-ruf-dropdown-panel").click();
  cy.contains("Logout").click();
  cy.contains("Sign in").should("be.visible");
});

Cypress.Commands.add("search", () => {
  cy.get('[data-cy="instrument-select-input"]').clear().click();
});

Cypress.Commands.add("highlight", ($el) => {
  $el.css("border", "1px solid magenta");
});

Cypress.Commands.add("upperDropDownPanel", () => {
  cy.get("sb-ruf-dropdown-panel").click();
});

Cypress.Commands.add("closeButtonUpper", () => {
  cy.get(".dropdown-panel-close-icon-container")
    .find('[fisicon="close"]')
    .click();
});

Cypress.Commands.add("saveWs", () => {
  cy.get("sb-ruf-dropdown-panel").click();
  cy.get("mat-list a").eq(0).click();
});

Cypress.Commands.add("saveWsAs", () => {
  cy.get("sb-ruf-dropdown-panel").click();
  cy.get("mat-list a").eq(1).click();
});

Cypress.Commands.add("instDetails", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Instrument details").click();
  cy.get(".mat-list-text").should("not.contain", "Instrument details");
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("derivativeSearch", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Search for Options").click();
  cy.get(".mat-list-text").should("not.contain", "Search for Options");
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("ordersTable", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Orders table").click();
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("orderBox", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Order box").click();
  cy.get(".mat-list-text").should("not.contain", "Order box");
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("addInsSearch", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Instrument search").click();
  cy.get(".mat-list-text").should("not.contain", "Instrument search");
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("orderHistory", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Order history").click();
  cy.get(".mat-list-text").should("not.contain", "Order history");
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("addAccountsTable", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Accounts table").click();
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("addAccountBalance", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Account balance").click();
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});

Cypress.Commands.add("addPositionsChart", () => {
  cy.get('[data-mat-icon-name="fis-icon-add"]').click();
  cy.get(".mat-list-text").contains("Positions chart").click();
  cy.get(".dropdown-panel-close-icon-container > .mat-focus-indicator").click();
});
