describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should display the login form", () => {
    cy.get("form").should("exist");
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.get('button[type="submit"]').should("contain", "Connexion");
  });

  it("should show an error if login credentials are incorrect", () => {
    cy.intercept("POST", "**/api/users/login", {
      statusCode: 401,
      body: { message: "Invalid email or password." },
    }).as("loginRequest");

    cy.get('input[name="email"]').type("wrong.email@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get('[data-testid="login-button"]').click();

    cy.wait("@loginRequest");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Erreur de réseau. Veuillez vérifier votre connexion."
    );
  });

  it("should log in an existing user and redirect based on conditions", () => {
    const userEmail = "john.doe@example.com";
    const userPassword = "password123";

    cy.intercept("POST", "**/api/users/login", {
      statusCode: 200,
      body: {
        id: 1,
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john.doe@example.com",
        userRole: "customer",
        mustChangePassword: false,
        isLostPassword: false,
      },
    }).as("loginRequest");

    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get("form").submit();

    cy.wait("@loginRequest").then((interception) => {
      const user = interception.response.body;
      if (user.isLostPassword) {
        cy.url().should("include", `/users/${user.id}/lost-password-login`);
      } else if (user.mustChangePassword) {
        cy.url().should("include", `/first-login/${user.id}`);
      } else {
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      }
    });

    cy.get(".Toastify__toast--success").should(
      "contain",
      "Connexion réussie !"
    );
  });

  it("should redirect to lost password page when clicking on the link", () => {
    cy.contains("Mot de passe oublié ?").click();
    cy.url().should("include", "/lost-password");
  });

  it("should redirect to register page when clicking on the link", () => {
    cy.contains("Pas encore de compte ? S'inscrire").click();
    cy.url().should("include", "/register");
  });
});
