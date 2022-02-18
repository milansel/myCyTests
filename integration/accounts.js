/// <reference types="cypress" />

describe("Account table and account balance widget", () => {
  beforeEach(() => {
    cy.fixture("users")
      .as("users")
      .then((users) => {
        cy.apiLogin(users.accUserName, users.accUserPass).wait(350);
      });

    cy.fixture("instruments").as("ins");
    cy.fixture("account.json").as("accs");

    cy.viewport(1920, 1080);
    cy.visit(Cypress.env("rufUrl"));

    // Stub local server data
    cy.intercept(
      "**/accounts/subAccountReferences?tradabilityAwipType=TRADABLE",
      { fixture: "account.json" }
    ).as("getAccounts");

    cy.get("@accs")
      .its("length")
      .then((acclength) => {
        cy.wait("@getAccounts")
          .its("response.body")
          .should("have.length", acclength);
      });

    cy.get("#mat-icon_2")
      .should("be.visible")
      .parent()
      .as("accountPage")
      .invoke("attr", "ng-reflect-message")
      .then((text) => {
        expect(text).to.equal("Account");
      });

    cy.get("@accountPage").click();
    cy.url().should("include", "#/accountTab");

    cy.orderBox();
    cy.addInsSearch();
    cy.addAccountsTable();
    cy.addAccountBalance();

    cy.get('[fisicon="refresh"]').click();
    cy.get(`sb-ruf-order`).find(`[ng-reflect-name="account"]`).click();
    cy.get('[data-cy="account-option"]').as("accCodeOnOrderBox");
  });

  it("C39208575 Acc code", function () {
    //accounts table - assert test account exists in Accounts table
    cy.contains("ACCOUNTS TABLE").should("be.visible");
    cy.get("sb-ruf-accounts-table")
      .find(".ag-center-cols-container")
      .find('[col-id="code"]')
      .filter(`:contains(${this.users.accCode})`)
      .as("accCodeAccountTable")
      .invoke("text")
      .as("textAccAccountTable");
    cy.get("@accCodeAccountTable").then(($testAccount) => {
      cy.highlight($testAccount);
    });
    cy.get("@textAccAccountTable").then(($account) => {
      expect($account.trim()).to.be.eql(`${this.users.accCode}`);
    });

    // click on account on orderbox and assert accountId is equal to test data
    cy.get("@accCodeOnOrderBox")
      .filter(`:contains(${this.users.accCode})`)
      .click()
      .invoke("text")
      .then(($account) => {
        expect($account.trim()).to.be.eql(`${this.users.accCode}`);
      });
    cy.get("@accCodeOnOrderBox")
      .filter(`:contains(${this.users.accCode})`)
      .click({ force: true });

    // account balance widget - assert test account exist the widget
    cy.contains("ACCOUNT BALANCE").should("be.visible");
    cy.get("sb-ruf-account-balance")
      .find("table tr td")
      .eq(1)
      .as("accCodeOnBalanceWidget");

    cy.get("@accCodeOnBalanceWidget").then(($accCodeOnBalanceWidget) => {
      cy.highlight($accCodeOnBalanceWidget);
    });
    cy.get("@accCodeOnBalanceWidget")
      .invoke("text")
      .then(($accCodeText) => {
        expect($accCodeText).to.be.eql(this.users.accCode);
      });

    cy.logout();
  });

  it("C39370638 Reserved amount", function () {
    // filter account at Orderbox
    cy.get("@accCodeOnOrderBox")
      .filter(`:contains(${this.users.accCode})`)
      .click({ force: true });

    // accounts table - filter acc code
    cy.get("sb-ruf-accounts-table")
      .find(".ag-center-cols-container")
      .find('[col-id="code"]')
      .filter(`:contains(${this.users.accCode})`)
      .as("accCodeAccountTable");

    cy.ordersTable();

    // select instrument from search
    cy.get("@ins").then(($ins) => {
      const insLong = $ins.insLongName[0];
      cy.search().type(insLong).wait(1000);
      cy.get('[data-cy="instrument-option"]').eq(0).click();
    });

    // initial reserved amount at accounts table
    cy.get("@accCodeAccountTable")
      .parent()
      .find('[col-id="reserved"]')
      .as("reservedFieldAtAccTable")
      .invoke("text")
      .as("initRAtable");

    // initial reserved amount at account widget
    cy.get("sb-ruf-account-balance")
      .find("td:nth-child(2)")
      .eq(3)
      .invoke("text")
      .as("initRAwidget");

    // placing new order
    // ***********
    cy.get('[fisicon="refresh"]').click();
    //**********
    cy.get('[data-cy="order-type-select"]').click();
    cy.get(
      '[data-cy="order-type-option"][ng-reflect-value="EXECUTION"]'
    ).click();

    cy.get('[data-cy="account-select"]').click();
    cy.get('[data-cy="account-option"]')
      .filter(`:contains(${this.users.accCode})`)
      .click();

    let volume = this.ins.orderVolume[0];
    let price = this.ins.orderPrice[0];
    let orderValue = volume * price;

    cy.get("@initRAtable").then(($initRAtable) => {
      let initRAtable = parseFloat($initRAtable.replace(/,/g, ""));
      // parseFloat($initRATable.replace(",", ""))
      cy.log("initRAtable", initRAtable);

      cy.get('[data-cy="volume-input"]').then((volumeInput) => {
        cy.wrap(volumeInput).type(volume);
      });
      cy.get('[data-cy="limit-input"]').then((priceInput) => {
        cy.wrap(priceInput).type(price);
      });
      cy.get('[data-cy="validate-button"]').click();
      cy.get('[data-cy="submit-button"]').click();
      cy.get("sb-ruf-order")
        .find(".ruf-label")
        .should("include.text", "Appropriateness level is insufficient");
      cy.getDataCy("confirm-button").click().wait(3000);

      cy.log("**ORDER IS PLACED ON THE MARKET**");

      // assert reserved amount at Accounts table
      cy.get("@reservedFieldAtAccTable").invoke("text").as("actualRAtable");
      cy.get("@reservedFieldAtAccTable").then(($reservedFieldAtAccTable) => {
        cy.highlight($reservedFieldAtAccTable);
      });

      cy.get("@actualRAtable").then(($actualRAtable) => {
        cy.log("initRAtable", this.initRAtable);
        cy.log("orderValue", orderValue);

        let expectedRAtable = orderValue + initRAtable;
        cy.log("**expectedRAtable**", `**${expectedRAtable}**`);

        let actualRAtable = parseFloat($actualRAtable.replace(/,/g, ""));
        cy.log("**actualRAtable**", `**${actualRAtable}**`);

        // assert expected vs actual RA value at Accounts table
        expect(expectedRAtable).to.be.eql(actualRAtable);
      });
    });

    // assert reserved amount at Account balance widget
    cy.get("sb-ruf-account-balance")
      .find("td:nth-child(2)")
      .eq(3)
      .as("newRAfieldWidget")
      .then(($reservedOnAccBalance) => {
        cy.highlight($reservedOnAccBalance);
      });

    cy.get("@newRAfieldWidget").invoke("text").as("newActualRAwidget");

    cy.get("@newActualRAwidget").then(($newActualRAwidget) => {
      cy.log("initRAwidget", this.initRAwidget);
      // parseFloat($initRAtable.replace(/,/g, ""));
      let initRAwidgetClean = parseFloat(
        this.initRAwidget.split(" ")[0].replace(/,/g, "")
      );

      cy.log("orderValue", orderValue);
      let expectedRAwidget = orderValue + initRAwidgetClean;
      cy.log("**expectedRAwidget**", `**${expectedRAwidget}**`);

      let actualRAwidget = parseFloat(
        $newActualRAwidget.split(" ")[0].replace(/,/g, "")
      );
      cy.wrap(actualRAwidget).as("actualRAwidget");
      cy.log("**actualRAwidget**", `**${actualRAwidget}**`);

      // actual vs expected RA value at account widget
      expect(expectedRAwidget).to.be.eql(actualRAwidget);
    });

    // DELETE created order in orders table
    cy.get("sb-ruf-orders-table")
      .find('[row-index="0"]')
      .as("firstRowOrdersTable");
    cy.get("@firstRowOrdersTable")
      .find('[col-id="instrument.longName"]')
      .click({ force: true })
      .rightclick({ force: true });

    // delete last order
    cy.get(".ag-menu-list").find(".ag-menu-option").eq(3).click().wait(1000);

    cy.log("**LAST ORDER IS DELETED**");

    // RA on widget after order delete
    cy.get("@newRAfieldWidget")
      .invoke("text")
      .as("actualRAwidgetAfterDelete")
      .then(() => {
        cy.log("actualRAwidgetAfterDelete", this.actualRAwidgetAfterDelete);

        let expectedRAwidgetAfterDelete = this.actualRAwidget - orderValue;
        cy.log("expectedRAwidgetAfterDelete", expectedRAwidgetAfterDelete).then(
          () => {
            let actualRAwidgetAfterDelete = parseFloat(
              this.actualRAwidgetAfterDelete.split(" ")[0].replace(/,/g, "")
            );

            // actual vs expected RA value at account widget after order is deleted
            expect(actualRAwidgetAfterDelete, "actual doesn't match").to.be.eql(
              expectedRAwidgetAfterDelete
            );
          }
        );
      });
  });
});
