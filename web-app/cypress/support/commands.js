// cypress/support/commands.js

Cypress.Commands.add("checkUserExists", (userEmail) => {
  return cy
    .request({
      method: "GET",
      url: `/api/users?email=${userEmail}`,
      failOnStatusCode: false,
    })
    .then((response) => {
      console.log("User check response:", response);
      return response;
    });
});

Cypress.Commands.add("mockAdminAuth", () => {
  const adminUser = {
    id: 1,
    userFirstName: "Admin",
    userLastName: "User",
    userEmail: "admin@example.com",
    userRole: "admin",
    token: "mock-jwt-token",
  };

  localStorage.setItem("userInfo", JSON.stringify(adminUser));
  localStorage.setItem(
    "expirationTime",
    new Date().getTime() + 30 * 24 * 60 * 60 * 1000
  );

  // Dispatch action only if store is available
  cy.window().then((win) => {
    if (win.store && typeof win.store.dispatch === "function") {
      win.store.dispatch({
        type: "auth/setCredentials",
        payload: adminUser,
      });
    }
  });
});

Cypress.Commands.add("clearMockAuth", () => {
  localStorage.clear();

  // Clear Redux store only if it's available
  cy.window().then((win) => {
    if (win.store && typeof win.store.dispatch === "function") {
      win.store.dispatch({ type: "auth/logout" });
    }
  });
});

Cypress.Commands.add(
  "addUser",
  (userFirstName, userLastName, userEmail, userRole) => {
    cy.get('input[placeholder="Prénom"]').type(userFirstName);
    cy.get('input[placeholder="Nom"]').type(userLastName);
    cy.get('input[placeholder="Nom d\'utilisateur"]').type(
      `${userFirstName.toLowerCase()}${userLastName.toLowerCase()}`
    );
    cy.get('input[placeholder="Email"]').type(userEmail);
    cy.get("select").select(userRole);
    cy.contains("button", "Ajouter").click();
    cy.get(".Toastify__toast--success").should(
      "contain",
      "Utilisateur ajouté avec succès"
    );
  }
);
