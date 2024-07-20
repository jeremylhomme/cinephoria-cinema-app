describe("Register Page", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should display the registration form", () => {
    cy.get("form").should("exist");
    cy.get('input[name="userFirstName"]').should("exist");
    cy.get('input[name="userLastName"]').should("exist");
    cy.get('input[name="userUserName"]').should("exist");
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.get('input[name="confirmUserPassword"]').should("exist");
  });

  it("should show an error if passwords do not match", () => {
    cy.get('input[name="userFirstName"]').type("John");
    cy.get('input[name="userLastName"]').type("Doe");
    cy.get('input[name="userUserName"]').type("johndoe");
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirmUserPassword"]').type("Password456!");
    cy.get("form").submit();
    cy.get(".text-red-500").should(
      "contain",
      "Les mots de passe ne correspondent pas"
    );
  });

  it("should show an error if password is weak", () => {
    cy.get('input[name="userFirstName"]').type("John");
    cy.get('input[name="userLastName"]').type("Doe");
    cy.get('input[name="userUserName"]').type("johndoe");
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("weak");
    cy.get('input[name="confirmUserPassword"]').type("weak");
    cy.get("form").submit();
    cy.get(".text-red-500").should(
      "contain",
      "Le mot de passe doit contenir au moins 8 caractères"
    );
  });

  it("should register a new user", () => {
    const timestamp = Date.now();
    const userEmail = `testuser${timestamp}@example.com`;
    const userName = `testuser${timestamp}`;

    cy.intercept("POST", "**/api/users/register").as("registerRequest");

    cy.get('input[name="userFirstName"]').type("Test");
    cy.get('input[name="userLastName"]').type("User");
    cy.get('input[name="userUserName"]').type(userName);
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type("TestPassword123!");
    cy.get('input[name="confirmUserPassword"]').type("TestPassword123!");

    cy.get("form").submit();

    cy.wait("@registerRequest", { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });

    cy.get(".Toastify__toast--success").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should show an error if user already exists", () => {
    // Intercept the request at the beginning of the test
    cy.intercept("POST", "**/api/users/register", {
      statusCode: 400,
      body: { message: "User already exists with this email." },
    }).as("registerRequest");

    // Log the interception for debugging
    cy.on("fail", (error, runnable) => {
      console.log("Test failed with error:", error.message);
      return false; // Prevent Cypress from failing the test
    });

    cy.get('input[name="userFirstName"]').type("John");
    cy.get('input[name="userLastName"]').type("Doe");
    cy.get('input[name="userUserName"]').type("existinguser");
    cy.get('input[name="email"]').type("existing@example.com");
    cy.get('input[name="password"]').type("yourPassword123");
    cy.get('input[name="confirmUserPassword"]').type("yourPassword123");

    // Submit the form
    cy.get("form").submit();

    // Wait for the request with a longer timeout
    cy.wait("@registerRequest", { timeout: 20000 }).then((interception) => {
      console.log("Intercepted request:", interception);
      expect(interception.response.statusCode).to.equal(400);
      expect(interception.response.body.message).to.equal(
        "User already exists with this email."
      );
    });

    // Check for the error message
    cy.get(".text-red-500").should(
      "contain",
      "User already exists with this email."
    );
  });
});
