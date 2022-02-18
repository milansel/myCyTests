/// <reference types="cypress" />

describe("Order entry widget test", () => {
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

    cy.get("@ins").then(($ins) => {
      const insLong = $ins.insLongName[0];
      cy.search().type(insLong).wait(1000);
      cy.get('[data-cy="instrument-option"]').eq(0).debug().click();
    });

    cy.ordersTable();
    cy.orderHistory();
  });

  it("C39208579 Fill out order entry form", function () {
    let insLong = this.ins.insLongName[0];
    let volume = this.ins.orderVolume;

    //order box
    cy.wrap(volume).each(($orderVolume, i) => {
      cy.get('[fisicon="refresh"]').click();
      cy.get("sb-ruf-order")
        .find('[data-cy="buy-or-sell-radio-group"]')
        .find('input[type="radio"][value="BUY"]')
        .check()
        .should("be.checked");

      cy.get('[data-cy="order-type-select"]').click();
      cy.get(
        '[data-cy="order-type-option"][ng-reflect-value="EXECUTION"]'
      ).click();

      cy.get('[data-cy="account-select"]').click();
      cy.get('[data-cy="account-option"]')
        .filter(`:contains(${this.users.accCode})`)
        .click();

      cy.get('[data-cy="volume-input"]').type($orderVolume);

      let price = this.ins.orderPrice[i];

      cy.get('[data-cy="limit-input"]').type(price);
      cy.get('[data-cy="validate-button"]').click();
      cy.get('[data-cy="submit-button"]').click();

      cy.get("sb-ruf-order")
        .find(".ruf-label")
        .should("include.text", "Appropriateness level is insufficient");
      cy.getDataCy("confirm-button").click().wait(1000);

      cy.log("**ORDER IS PLACED ON THE MARKET**");

      // new order button on order box
      if (i < volume.length - 1) {
        cy.get('[fisicon="refresh"]').click();
        //assert volume is empty
        cy.get('[data-cy="volume-input"]')
          .invoke("prop", "value")
          .then((volValue) => {
            expect(volValue).to.be.empty;
          });
        // assert price is empty
        cy.get('[data-cy="limit-input"]')
          .invoke("prop", "value")
          .then((priceValue) => {
            cy.log(priceValue);
            expect(priceValue).to.be.empty;
          });
        // assert best price is not checked
        cy.get('[data-cy="best-price-checkbox"]')
          .find('input[type="checkbox"]')
          .should("not.be.checked");
      }

      // Orders table, first raw
      cy.get("sb-ruf-orders-table")
        .find('[row-index="0"]')
        .as("firstRowOrdersTable");

      // assert expected instrument
      cy.get("@firstRowOrdersTable")
        .find('[col-id="instrument.longName"]')
        .click({ force: true })
        .invoke("text")
        .then((insText) => {
          expect(insText).to.include(insLong);
        });

      // assert expected market status
      cy.get("@firstRowOrdersTable")
        .find('[col-id="status"]')
        .invoke("text")
        .then((marketText) => {
          expect(marketText).to.be.oneOf(["Market", "Waiting"]);
        });

      // assert expected volume
      cy.get("@firstRowOrdersTable")
        .find('[col-id="volume"]')
        .find("span")
        .eq(2)
        .invoke("text")
        .then((textVolume) => {
          expect(parseInt(textVolume)).to.equal($orderVolume);
        });
      // assert expected price
      cy.get("@firstRowOrdersTable")
        .find('[col-id="price"]')
        .find("span")
        .eq(2)
        .invoke("text")
        .then((textPrice) => {
          expect(parseInt(textPrice)).to.equal(price);
          // expect(textPrice).to.equal(price.toString());
        });
    });
  });

  it("C39370643 Incorrect order filling", function () {
    cy.get("sb-ruf-order")
      .find('[data-cy="buy-or-sell-radio-group"]')
      .find('input[type="radio"][value="BUY"]')
      .check()
      .should("be.checked");
    cy.get('[data-cy="order-type-select"]').click();
    cy.get(
      '[data-cy="order-type-option"][ng-reflect-value="EXECUTION"]'
    ).click();

    cy.get('[data-cy="account-select"]').click();
    cy.get('[data-cy="account-option"]').eq(0).click();

    cy.get('[data-cy="volume-input"]').type("99999999999");
    cy.get('[data-cy="limit-input"]').type("9");
    cy.get('[data-cy="validate-button"]').click();
    cy.get("snack-bar-container")
      .invoke("text")
      .then((textMessage) => {
        expect(textMessage).to.contain("credit limit");
      });
  });

  it("C39370644 Modify order", function () {
    // Orders table, first raw
    cy.get("sb-ruf-orders-table")
      .find('[row-index="0"]')
      .as("firstRowOrdersTable");
    cy.get("@firstRowOrdersTable")
      .find('[col-id="instrument.longName"]')
      .click({ force: true });

    //mofify volume on order
    let newVolume = this.ins.newVolume[0];
    cy.get('[data-cy="volume-input"]').clear().type(newVolume);
    cy.get('[data-cy="modify-button"]').click().wait(1000);

    cy.get("sb-ruf-order")
      .find(".ruf-label")
      .should("include.text", "Appropriateness level is insufficient");
    cy.getDataCy("confirm-button").click().wait(1000);

    cy.log("**ORDER IS MODIFIED**");

    // assert expected volume in orders table
    cy.get("@firstRowOrdersTable")
      .find('[col-id="volume"]')
      .find("span")
      .eq(2)
      .invoke("text")
      .then((textVolume) => {
        expect(parseInt(textVolume)).to.equal(newVolume);
      });
  });

  it("C39370645 Delete order", function () {
    // Orders table, first raw
    cy.get("sb-ruf-orders-table")
      .find('[row-index="0"]')
      .as("firstRowOrdersTable");
    cy.get("@firstRowOrdersTable")
      .find('[col-id="instrument.longName"]')
      .click({ force: true })
      .rightclick({ force: true });
    // delete last order
    cy.get(".ag-menu-list").find(".ag-menu-option").eq(3).click();

    cy.get("@firstRowOrdersTable")
      .find('[col-id="instrument.longName"]')
      .click({ force: true });

    cy.get("@firstRowOrdersTable")
      .find('[col-id="status"]')
      .wait(200)
      .invoke("text")
      .then((marketText) => {
        expect(marketText).to.be.oneOf(["Deleted", "Delete waiting"]);
      });
    // assert deleted order on order history widget
    cy.get("sb-ruf-order-history")
      .find('[ref="eContainer"]')
      .find('[row-index="0"]')
      .as("firstRawHistory");
    cy.get("@firstRawHistory")
      .find('[col-id="order.status"]')
      .invoke("text")
      .should("contain", "Deleted");
  });
});
