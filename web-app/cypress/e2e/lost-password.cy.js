describe("Lost Password Page", () => {
  beforeEach(() => {
    cy.visit("/lost-password");
  });

  it("should display the lost password form", () => {
    cy.get("form").should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('button[type="submit"]')
      .should("exist")
      .and("contain", "Envoyer les instructions");
    cy.get("h2").should("contain", "Réinitialisation du mot de passe");
  });

  it("should show an error for non-existent email", () => {
    cy.intercept("POST", "**/api/users/reset-password", {
      statusCode: 404,
      body: { message: "Utilisateur non trouvé." },
    }).as("resetPasswordRequest");

    cy.get('input[type="email"]').type("nonexistent@example.com");
    cy.get("form").submit();

    cy.wait("@resetPasswordRequest");
    cy.get(".Toastify__toast--error")
      .should("be.visible")
      .and("contain", "Utilisateur non trouvé");
  });

  it("should show a success message for valid email submission", () => {
    cy.intercept("POST", "**/api/users/reset-password", {
      statusCode: 200,
      body: {
        message: "Instructions de réinitialisation du mot de passe envoyées.",
      },
    }).as("resetPasswordRequest");

    cy.get('input[type="email"]').type("existing@example.com");
    cy.get("form").submit();

    cy.wait("@resetPasswordRequest");
    cy.get(".Toastify__toast--success")
      .should("be.visible")
      .and(
        "contain",
        "Instructions de réinitialisation envoyées à votre email"
      );
  });

  it("should show a success message for valid email submission", () => {
    cy.intercept("POST", "**/api/users/reset-password", {
      statusCode: 200,
      body: {
        message: "Instructions de réinitialisation envoyées à votre email.",
      },
    }).as("resetPasswordRequest");

    cy.get('input[type="email"]').type("valid@example.com");
    cy.get("form").submit();

    cy.wait("@resetPasswordRequest");
    cy.get(".Toastify__toast--success")
      .should("be.visible")
      .and(
        "contain",
        "Instructions de réinitialisation envoyées à votre email."
      );
  });

  it("should handle server errors gracefully", () => {
    cy.intercept("POST", "**/api/users/reset-password", {
      statusCode: 500,
      body: { message: "Une erreur est survenue" },
    }).as("resetPasswordRequest");

    cy.get('input[type="email"]').type("existing@example.com");
    cy.get("form").submit();

    cy.wait("@resetPasswordRequest");
    cy.get(".Toastify__toast--error")
      .should("be.visible")
      .and("contain", "Une erreur est survenue");
  });

  it("should disable submit button while processing", () => {
    cy.intercept("POST", "**/api/users/reset-password", {
      delay: 1000,
      statusCode: 200,
      body: {
        message: "Instructions de réinitialisation envoyées à votre email.",
      },
    }).as("resetPasswordRequest");

    cy.get('input[type="email"]').type("existing@example.com");
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]')
      .should("be.disabled")
      .and("contain", "Envoi en cours...");

    cy.wait("@resetPasswordRequest");
    cy.get('button[type="submit"]')
      .should("not.be.disabled")
      .and("contain", "Envoyer les instructions");
  });
});
