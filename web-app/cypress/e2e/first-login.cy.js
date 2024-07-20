describe("First Login", () => {
  beforeEach(() => {
    // Intercept the login request and respond with a user that must change password
    cy.intercept("POST", "**/api/users/login", {
      statusCode: 200,
      body: {
        id: 1,
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john@example.com",
        mustChangePassword: true,
      },
    }).as("loginRequest");

    // Intercept any request that might include auth headers
    cy.intercept("**/api/**", (req) => {
      req.headers["Authorization"] = "Bearer fake-jwt-token";
    }).as("authRequest");

    // Login with test credentials
    cy.visit("/login");
    cy.get('input[name="email"]').type("john@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get("form").submit();

    // Wait for login request and check redirection
    cy.wait("@loginRequest");
    cy.url().should("include", "/first-login");
  });

  it("should redirect to first login page and allow password change", () => {
    // Intercept the password update request
    cy.intercept("PUT", "**/api/users/*/update-first-login-password", {
      statusCode: 200,
      body: {
        id: 1,
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john@example.com",
        userRole: "customer",
        mustChangePassword: false,
      },
    }).as("updatePasswordRequest");

    // Intercept the logout request
    cy.intercept("POST", "**/api/users/logout", {
      statusCode: 200,
      body: { message: "Logged out successfully" },
    }).as("logoutRequest");

    // Check if the first login page is displayed correctly
    cy.contains("Bienvenue John !").should("be.visible");
    cy.contains(
      "Veuillez définir un nouveau mot de passe pour continuer"
    ).should("be.visible");

    // Fill in new password
    const newPassword = "NewPassword123!";
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="confirmNewPassword"]').type(newPassword);

    // Submit new password
    cy.get("form").submit();

    // Wait for update password request
    cy.wait("@updatePasswordRequest");

    // Wait for logout request
    cy.wait("@logoutRequest");

    // Check for success message and redirection to login page
    cy.get(".Toastify__toast--success")
      .should("be.visible")
      .and("contain", "Mot de passe mis à jour avec succès");
    cy.url().should("include", "/login");
  });

  it("should show error for mismatched passwords", () => {
    // Fill in mismatched passwords
    cy.get('input[name="newPassword"]').type("NewPassword123!");
    cy.get('input[name="confirmNewPassword"]').type("DifferentPassword123!");

    // Submit form
    cy.get("form").submit();

    // Check for error message
    cy.get(".Toastify__toast--error")
      .should("be.visible")
      .and("contain", "Les mots de passe ne correspondent pas");
  });

  it("should show error for weak password", () => {
    // Fill in weak password
    cy.get('input[name="newPassword"]').type("weak");
    cy.get('input[name="confirmNewPassword"]').type("weak");

    // Submit form
    cy.get("form").submit();

    // Check for error message
    cy.get(".Toastify__toast--error")
      .should("be.visible")
      .and("contain", "Le mot de passe doit contenir au moins 8 caractères");
  });

  it("should handle server error gracefully", () => {
    // Intercept the password update request with an error
    cy.intercept("PUT", "**/api/users/1/update-first-login-password", {
      statusCode: 500,
      body: { message: "Server error" },
    }).as("updatePasswordRequest");

    // Fill in new password
    const newPassword = "NewPassword123!";
    cy.get('input[name="newPassword"]').type(newPassword);
    cy.get('input[name="confirmNewPassword"]').type(newPassword);

    // Submit new password
    cy.get("form").submit();

    // Wait for update password request
    cy.wait("@updatePasswordRequest");

    // Check for error message
    cy.get(".Toastify__toast--error")
      .should("be.visible")
      .and("contain", "Échec de la mise à jour du mot de passe");
  });
});
