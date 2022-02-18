/// <reference types="cypress" />

describe("Search for instrument", () => {
  beforeEach(() => {
    cy.fixture("users")
      .as("users")
      .then((users) => {
        cy.apiLogin(users.accUserName, users.accUserPass).wait(350);
      });
    cy.fixture("instruments").as("ins");

    cy.viewport(1920, 1080);
    cy.visit(Cypress.env("rufUrl"));
  });

  it("C39204007 Search widget", function () {
    // add instrument details widget
    cy.instDetails();

    cy.contains("All").click();

    const labels = [
      "All",
      "Short Name",
      "Long Name",
      "ISIN",
      "WKN",
      "Underlying",
    ];

    cy.get("mat-option[ng-reflect-value]").each((label, index) => {
      const labelText = label.text().trim();
      expect(labelText).to.equal(labels[index]);
    });

    cy.get("mat-option[ng-reflect-value]").eq(2).click();

    const insLong = this.ins.insLongName;
    const insShort = this.ins.insShortName;

    insLong.forEach((long, i) => {
      console.log(i);
      cy.search().type(long).wait(1000);
      cy.get(".cdk-overlay-pane")
        .find('[role="listbox"]')
        .find("mat-option")
        .find(".mat-option-text")
        .then(($longName) => {
          expect($longName.text().trim()).to.contains(long);
          cy.wrap($longName).eq(0).click();

          let short = insShort[i];
          cy.get("sb-ruf-instrument-details")
            .find("table tr")
            .find("td:nth-child(2)")
            .eq(0)
            .as("shortName");
          cy.get("@shortName").then(($shortName) => {
            cy.highlight($shortName);
          });
          cy.get("@shortName")
            .invoke("text")
            .then(($shortName) => {
              expect($shortName).to.equal(short);
            });
        });
    });
  });

  it("C39370461 Search for Options & Futures widget", function () {
    // const underlying = this.ins.underlying[0];
    const underlying = this.ins.underlying;
    const market = this.ins.market[0];

    // add derivative search widget
    cy.derivativeSearch();

    // add instrument details widget
    cy.instDetails();

    // select market
    cy.wrap(underlying).each((undItem, i) => {
      cy.getDataCy("market-select-input").type(market);
      cy.getDataCy("market-option").click();

      // select underlying
      cy.getDataCy("underlying-input").type(undItem);
      cy.getDataCy("underlying-option").eq(0).click();

      // select type
      cy.getDataCy("instrument-type-input").type("OPT").wait(200);
      cy.getDataCy("instrument-type-option").eq(0).click();

      // select expiration
      cy.getDataCy("expiration-data-input").click();
      cy.getDataCy("expiration-date-option").eq(0).click();

      // select strike
      cy.getDataCy("strike-price-input").click();
      cy.getDataCy("strike-price-option").eq(0).click();

      //select version
      cy.getDataCy("version-input").click();
      cy.getDataCy("version-option").eq(0).click();

      //select call or put
      cy.getDataCy("put-radio")
        .find("input")
        .check({ force: true })
        .should("be.checked");

      // select short name on instrument details widget
      cy.get("sb-ruf-instrument-details")
        .find("table tr")
        .find("td:nth-child(2)")
        .eq(0)
        .then(($shortNameOnInstWidget) => {
          const shortNameOnInstWidget = $shortNameOnInstWidget.text();
          cy.highlight($shortNameOnInstWidget);
          // select invisible short name on derivative widget
          cy.get('[data-cy="hidden-instrument-short-name"]')
            .invoke("text")
            .then((hiddenShortName) => {
              expect(hiddenShortName).to.be.equal(shortNameOnInstWidget);
            });
        });
    });
  });
});
