describe("User Management", () => {
  const mockUsers = [
    {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userEmail: "john.doe@example.com",
      userUserName: "johndoe",
      userRole: "employee",
    },
    {
      id: 2,
      userFirstName: "Jane",
      userLastName: "Smith",
      userEmail: "jane.smith@example.com",
      userUserName: "janesmith",
      userRole: "admin",
    },
  ];

  beforeEach(() => {
    cy.mockAdminAuth();
    cy.intercept("GET", `${Cypress.env("VITE_API_URL")}/api/users`, {
      statusCode: 200,
      body: mockUsers,
    }).as("getUsers");
    cy.visit("/admin/user-list");
    cy.wait("@getUsers");
  });

  afterEach(() => {
    cy.clearMockAuth();
  });

  it("displays the user list", () => {
    cy.get("table").should("exist");
    cy.contains("h1", "Utilisateurs").should("be.visible");

    // Check that there's at least one user in the table
    cy.get("table tbody tr").should("have.length.at.least", 1);

    // Log the actual number of users for debugging
    cy.get("table tbody tr").then(($rows) => {
      cy.log(`Actual number of users: ${$rows.length}`);
    });
  });

  it("adds a new user", () => {
    const newUser = {
      userFirstName: "New",
      userLastName: "User",
      userEmail: `newuser${Date.now()}@example.com`,
      userUserName: `newuser${Date.now()}`,
      userRole: "employee",
    };

    cy.intercept("POST", `${Cypress.env("VITE_API_URL")}/api/users`, {
      statusCode: 201,
      body: { ...newUser, id: 3, message: "User created successfully" },
    }).as("createUser");

    cy.get('input[placeholder="Prénom"]').type(newUser.userFirstName);
    cy.get('input[placeholder="Nom"]').type(newUser.userLastName);
    cy.get('input[placeholder="Nom d\'utilisateur"]').type(
      newUser.userUserName
    );
    cy.get('input[placeholder="Email"]').type(newUser.userEmail);
    cy.get("select").select(newUser.userRole);

    cy.contains("button", "Ajouter").click();

    cy.wait("@createUser");
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Utilisateur ajouté avec succès"
    );
  });

  it("edits an existing user", () => {
    cy.intercept("PUT", `${Cypress.env("VITE_API_URL")}/api/users/*`, {
      statusCode: 200,
      body: { message: "User updated successfully" },
    }).as("updateUser");

    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get("[data-testid='PencilSquareIcon']").click();
      });

    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get('input[placeholder="Prénom"]').clear().type("UpdatedJohn");
        cy.get('input[placeholder="Nom"]').clear().type("UpdatedDoe");
        cy.get('input[placeholder="Email"]')
          .clear()
          .type("updated.john@example.com");
        cy.get("select").select("employee");
      });

    cy.contains("button", "Enregistrer").click();

    cy.wait("@updateUser");
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Utilisateur mis à jour avec succès"
    );
  });

  it("deletes a user", () => {
    cy.intercept("DELETE", `${Cypress.env("VITE_API_URL")}/api/users/*`, {
      statusCode: 200,
      body: { message: "User deleted successfully" },
    }).as("deleteUser");

    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get("[data-testid='TrashIcon']").click();
      });

    cy.on("window:confirm", () => true);

    cy.wait("@deleteUser");
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Utilisateur supprimé avec succès"
    );
  });

  it("generates a new password for a user", () => {
    cy.intercept(
      "PUT",
      `${Cypress.env("VITE_API_URL")}/api/users/*/update-password`,
      {
        statusCode: 200,
        body: { message: "New password generated and sent to user's email" },
      }
    ).as("updatePassword");

    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.contains("Générer un nouveau mot de passe").click();
      });

    cy.wait("@updatePassword");
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Nouveau mot de passe généré avec succès"
    );
  });

  it("prevents deletion of the last admin user", () => {
    cy.intercept("GET", `${Cypress.env("VITE_API_URL")}/api/users`, {
      statusCode: 200,
      body: [mockUsers[1]], // Only return the admin user
    }).as("getUsers");

    cy.visit("/admin/user-list");
    cy.wait("@getUsers");

    cy.get("[data-testid='TrashIcon']").click();
    cy.on("window:confirm", () => true);

    cy.get(".Toastify__toast--error").should(
      "contain",
      "Impossible de supprimer le dernier administrateur"
    );
  });
});
