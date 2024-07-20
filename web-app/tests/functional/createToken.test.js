import { test } from "vitest";
import jwt from "jsonwebtoken";
import sinon from "sinon";
import dotenv from "dotenv";
import createToken from "../../backend/utils/createToken.js";

dotenv.config({ path: ".env.docker.test" });

test("should create a token and set it as a cookie", () => {
  const userId = "testUserId";
  const mockToken = "mockToken";
  const mockRes = {
    cookie: sinon.fake(),
  };

  const signStub = sinon.stub(jwt, "sign").returns(mockToken);
  const result = createToken(mockRes, userId);

  sinon.assert.calledWith(signStub, { userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  sinon.assert.calledWith(mockRes.cookie, "jwt", mockToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  sinon.assert.match(result, mockToken);

  signStub.restore();
});
