/// <reference types="cypress" />

describe("Login page", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit(Cypress.env("rufUrl"));
    cy.fixture("users").as("users");
  });

  it("C39208578 Login account user", function () {
    cy.get("@users").then((users) => {
      cy.login(users.accUserName, users.accUserPass);
      cy.get("sb-ruf-dropdown-panel").click();
      cy.get("b").should("have.text", users.accUserName);
    });
    cy.get(
      ".dropdown-panel-close-icon-container > .mat-focus-indicator"
    ).click();
    cy.get("#mat-icon_0")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Trading");
      });
    cy.get("#mat-icon_1")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Portfolio");
      });
    cy.get("#mat-icon_2")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Account");
      });
    cy.get("#mat-icon_3")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Quotes");
      });
    cy.get("#mat-icon_4")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Watch list");
      });
    cy.logout();
  });

  it("C39370639 Login broker user", function () {
    cy.get("@users").then((users) => {
      cy.login(users.broUserName, users.broUserPass);
      cy.get("sb-ruf-dropdown-panel").click();
      cy.get("b").should("have.text", users.broUserName);
    });
    cy.get(
      ".dropdown-panel-close-icon-container > .mat-focus-indicator"
    ).click();
    cy.get("#mat-icon_0")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Trading");
      });
    cy.get("#mat-icon_1")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Portfolio");
      });
    cy.get("#mat-icon_2")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Account");
      });
    cy.get("#mat-icon_3")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Quotes");
      });
    cy.get("#mat-icon_4")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Watch list");
      });
    cy.logout();
  });

  it("C39370640 Login admin user", function () {
    const adminUser = this.users.adminUserName;
    const adminPass = this.users.adminUserPass;
    cy.login(adminUser, adminPass);

    cy.get("sb-ruf-dropdown-panel").click();
    cy.get("b").should("have.text", adminUser);
    cy.get(
      ".dropdown-panel-close-icon-container > .mat-focus-indicator"
    ).click();
    cy.get("#mat-icon_0")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Trading");
      });
    cy.get("#mat-icon_1")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Portfolio");
      });
    cy.get("#mat-icon_2")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Account");
      });
    cy.get("#mat-icon_3")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Quotes");
      });
    cy.get("#mat-icon_4")
      .should("be.visible")
      .parent()
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Watch list");
      });
    cy.logout();
  });

  it("C39370641 Login with wrong credentials", function () {
    cy.get("@users").then((users) => {
      cy.login(users.accUserName, "wrongpass");
    });
    cy.contains("Wrong username").should(
      "have.text",
      "Wrong username or password."
    );
    cy.reload();
    cy.login("unknown", "wrongpass");
    cy.contains("Wrong username").should(
      "have.text",
      "Wrong username or password."
    );
    cy.logout();
  });

  it("C39370642 Forgot password dialog", function () {
    cy.contains("forgot my password").click();
    cy.get('[data-placeholder="log name or e-mail"]').click().type("anyuser");
    cy.contains("Submit").click();
    cy.contains("Password reset request sent").should(
      "have.text",
      "Password reset request sent. You should get message with reset code on your e-mail address. If you don't receive the message please contact system administrator."
    );
  });

  it("API login test", function () {
    cy.apiLogin(this.users.broUserName, this.users.broUserPass);

    cy.reload();

    cy.addAccountsTable();

    cy.get("@responseApiLogin").then((body) => {
      const jwtAccessToken = body.jwtAccessToken;
      cy.log("jwtAccessToken: ", `**${jwtAccessToken}**`);

      console.log(body);
      console.log(body.jwtAccessToken.length);

      expect(body.loggedInUser).to.eql(this.users.broUserName);
      expect(body.loginStatus).to.eql("ACCEPTED");
      expect(body).to.have.property("jwtAccessToken");
      expect(body.jwtAccessToken).to.have.lengthOf("272");

      // cy.wrap(jwtAccessToken).as("jwtAccessToken");
    });

    // cy.get("@jwtAccessToken").then((token) => {
    //   cy.log("Token from aliasing", token);
    // });
  });
});
