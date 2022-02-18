/// <reference types="cypress" />

describe("Workspace", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("rufUrl"));

    cy.fixture("users")
      .as("users")
      .then((users) => {
        cy.apiLogin(users.broUserName, users.broUserPass).wait(400);
      });
    cy.reload();
  });

  it("Save 1st workspace AS", function () {
    // delete all workspaces for logged in user
    cy.sqlServer(
      `delete from User_workspaces where id in ( select uw.id from Users u join User_workspaces uw ON u.id = uw.user_id where u.log_name = '${this.users.broUserName}' )`
    );

    cy.get('[ng-reflect-message="Portfolio"]').click();
    // adding position chart on Portfolio page
    cy.addPositionsChart();
    cy.saveWsAs();
    cy.get('[ng-reflect-placeholder="Workspace name"]')
      .click()
      .type("1stWsTest");
    cy.get("sb-ruf-save-workspace-as-modal")
      .find(".ruf-button-wrapper")
      .find("button")
      .click();
    cy.upperDropDownPanel();
    cy.getDataCy("workspace-name")
      .eq(1)
      .invoke("text")
      .then(($actualText) => {
        expect($actualText).to.contain("1stWsTest");
      });
  });

  it("Save workspace", function () {
    cy.get('[ng-reflect-message="Portfolio"]').click();
    // assert element is visible after re-login
    cy.contains("POSITIONS CHART").should("be.visible");

    cy.get('[ng-reflect-message="Portfolio"]').click();
    cy.instDetails();
    cy.saveWs();
  });

  it("Save workspace 2", function () {
    cy.get('[ng-reflect-message="Portfolio"]').click();

    // assert both elements are visible after re-login
    cy.contains("POSITIONS CHART").should("be.visible");
    cy.contains("INSTRUMENT DETAILS").should("be.visible");
  });

  it("Save 2nd workspace AS", function () {
    // navigate to Quotes page
    cy.get('[ng-reflect-message="Quotes"]').click();
    cy.addInsSearch();
    cy.saveWsAs();
    cy.get('[ng-reflect-placeholder="Workspace name"]')
      .click()
      .type("2ndWsTest");
    cy.contains("Submit").click();

    cy.upperDropDownPanel();
    // click on first workspace '1stWsTest' - redirection should follow
    cy.getDataCy("workspace-name").eq(1).click().wait(1000);
    cy.contains("POSITIONS CHART").should("not.exist");
    cy.contains("INSTRUMENT DETAILS").should("not.exist");
    cy.log("Position chart and Inst details widgets don't exist at Quote page");
  });

  it("Autosave workspace", function () {
    cy.upperDropDownPanel().wait(500);
    cy.getDataCy("workspace-name").eq(2).click();

    cy.derivativeSearch();

    // Turn autosave ON
    cy.upperDropDownPanel();
    cy.getDataCy("autosave-workspace-on-logout-toggle")
      .as("autosaveWs")
      .click();
    cy.get("@autosaveWs")
      .invoke("attr", "ng-reflect-checked")
      .then(($attrNg) => {
        let boolValueTrue = $attrNg == "true";
        expect(boolValueTrue).to.be.true;
        cy.log("Autosave WS is ON");
      });
    cy.get('[rufid="theme_toggle_button"]').eq(1).click();
    cy.get(
      '[class="fis-override ruf-dropdown-panel-container ng-star-inserted"]'
    ).should("have.css", "background-color", "rgb(36, 36, 36)");
  });

  it("Autosave workspace 2", function () {
    cy.wait(500).contains("SEARCH FOR OPTIONS").should("exist");
    cy.log("Search for Options & Futures exist on page");

    // Turn autosave OFF
    cy.upperDropDownPanel();
    cy.getDataCy("autosave-workspace-on-logout-toggle")
      .as("autosaveWs")
      .click();
    cy.get("@autosaveWs")
      .invoke("attr", "ng-reflect-checked")
      .then(($attrNg) => {
        let boolValueFalse = $attrNg == "true";
        expect(boolValueFalse).to.be.false;
        cy.log("Autosave WS is OFF");
      });
    cy.closeButtonUpper();
    cy.orderHistory();
  });

  it("Autosave workspace 3", function () {
    cy.contains("ORDER HISTORY").should("not.exist");

    //assert autosave is off, after login
    cy.upperDropDownPanel();
    cy.getDataCy("autosave-workspace-on-logout-toggle")
      .invoke("attr", "ng-reflect-checked")
      .then(($attrNg) => {
        let boolValueFalse = $attrNg == "true";
        expect(boolValueFalse).to.be.false;
        cy.log("Autosave WS is OFF, after login");
      });
    // cy.contains("Logout").click();
  });

  it("Delete workspaces", function () {
    // click on untitled workspace
    cy.upperDropDownPanel().wait(500);
    cy.getDataCy("workspace-name").eq(0).click();

    // delete first workspace
    cy.upperDropDownPanel().wait(500);
    cy.getDataCy("delete-workspace-icon").eq(0).click();
    cy.contains("1stWsTest").should("not.exist");

    // Delete '2ndWsTest' workspace
    cy.upperDropDownPanel().wait(500);
    cy.getDataCy("delete-workspace-icon").eq(0).click();
    cy.contains("2ndWsTest").should("not.exist");

    cy.log("No workspaces left");
    cy.logout();
  });
});
