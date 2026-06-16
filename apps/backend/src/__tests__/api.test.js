require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Mocks antes de qualquer import do app
jest.mock("../config/db", () => jest.fn());
jest.mock("../config/redis", () => ({
  connectRedis: jest.fn(),
  redisClient: {
    isOpen: false,
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
  },
}));

const app = require("../app");

const JWT_SECRET = process.env.JWT_SECRET || "florita_token_ultra_secreto_2026";

// Gera um token válido para testes autenticados
function makeToken(payload = {}) {
  return jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), name: "Teste", ...payload },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// =============================================================================
// 1. Rota raiz
// =============================================================================
describe("GET /", () => {
  it("deve retornar 200 com mensagem English Dictionary", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "English Dictionary" });
  });
});

// =============================================================================
// 2. Auth - Signup
// =============================================================================
describe("POST /auth/signup", () => {
  const User = require("../models/User");

  beforeEach(() => jest.clearAllMocks());

  it("deve retornar 400 quando campos obrigatórios estão ausentes", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ email: "teste@email.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("deve retornar 400 quando e-mail já está em uso", async () => {
    jest.spyOn(User, "findOne").mockResolvedValueOnce({ _id: "existente" });

    const res = await request(app)
      .post("/auth/signup")
      .send({
        name: "Teste",
        email: "existente@email.com",
        password: "Senha@123",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/e-mail/i);
  });

  it("deve retornar 200 com id, name e token em cadastro válido", async () => {
    const fakeUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Novo Usuario",
      email: "novo@email.com",
    };

    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(User, "create").mockResolvedValueOnce(fakeUser);

    const res = await request(app)
      .post("/auth/signup")
      .send({
        name: "Novo Usuario",
        email: "novo@email.com",
        password: "Senha@123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("token");
  });
});

// =============================================================================
// 3. Auth - Signin
// =============================================================================
describe("POST /auth/signin", () => {
  const User = require("../models/User");

  beforeEach(() => jest.clearAllMocks());

  it("deve retornar 400 quando campos estão ausentes", async () => {
    const res = await request(app)
      .post("/auth/signin")
      .send({ email: "teste@email.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("deve retornar 400 para credenciais inválidas", async () => {
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/auth/signin")
      .send({ email: "naoexiste@email.com", password: "Senha@123" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("deve retornar 200 com token em login válido", async () => {
    const fakeUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Usuario Valido",
      email: "valido@email.com",
      comparePassword: jest.fn().mockResolvedValueOnce(true),
    };

    jest.spyOn(User, "findOne").mockResolvedValueOnce(fakeUser);

    const res = await request(app)
      .post("/auth/signin")
      .send({ email: "valido@email.com", password: "Senha@123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.token).toMatch(/^Bearer /);
  });
});

// =============================================================================
// 4. Dicionário - Listagem
// =============================================================================
describe("GET /entries/en", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/entries/en");
    expect(res.status).toBe(401);
  });

  it("deve retornar 200 com estrutura de paginação por cursor", async () => {
    const Dictionary = require("../models/Dictionary");

    const fakeWords = [{ word: "fire" }, { word: "firefly" }];

    jest.spyOn(Dictionary, "countDocuments").mockResolvedValueOnce(2);
    jest.spyOn(Dictionary, "find").mockReturnValueOnce({
      sort: () => ({ limit: () => Promise.resolve(fakeWords) }),
    });
    jest
      .spyOn(Dictionary, "findOne")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const token = makeToken();
    const res = await request(app).get("/entries/en").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("totalDocs");
    expect(res.body).toHaveProperty("hasNext");
    expect(res.body).toHaveProperty("hasPrev");
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});

// =============================================================================
// 5. Dicionário - Detalhes da palavra
// =============================================================================
describe("GET /entries/en/:word", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/entries/en/fire");
    expect(res.status).toBe(401);
  });

  it("deve retornar 404 quando palavra não existe na API externa", async () => {
    const axios = require("axios");
    const History = require("../models/History");

    jest.spyOn(axios, "get").mockRejectedValueOnce({
      response: { status: 404 },
    });

    jest.spyOn(History, "updateOne").mockResolvedValueOnce({});

    const token = makeToken();
    const res = await request(app)
      .get("/entries/en/palavrainexistente")
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("deve retornar 200 e injetar headers x-cache e x-response-time", async () => {
    const axios = require("axios");
    const History = require("../models/History");

    const fakeData = [{ word: "fire", meanings: [] }];

    jest.spyOn(axios, "get").mockResolvedValueOnce({ data: fakeData });
    jest.spyOn(History, "updateOne").mockResolvedValueOnce({});

    const token = makeToken();
    const res = await request(app)
      .get("/entries/en/fire")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("x-cache");
    expect(res.headers).toHaveProperty("x-response-time");
  });
});

// =============================================================================
// 6. Favoritar palavra
// =============================================================================
describe("POST /entries/en/:word/favorite", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).post("/entries/en/fire/favorite");
    expect(res.status).toBe(401);
  });

  it("deve retornar 204 ao favoritar com sucesso", async () => {
    const Favorite = require("../models/Favorite");
    jest.spyOn(Favorite, "create").mockResolvedValueOnce({});

    const token = makeToken();
    const res = await request(app)
      .post("/entries/en/fire/favorite")
      .set(authHeader(token));

    expect(res.status).toBe(204);
  });

  it("deve retornar 400 quando palavra já está favoritada", async () => {
    const Favorite = require("../models/Favorite");
    jest.spyOn(Favorite, "create").mockRejectedValueOnce({ code: 11000 });

    const token = makeToken();
    const res = await request(app)
      .post("/entries/en/fire/favorite")
      .set(authHeader(token));

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});

// =============================================================================
// 7. Desfavoritar palavra
// =============================================================================
describe("DELETE /entries/en/:word/unfavorite", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).delete("/entries/en/fire/unfavorite");
    expect(res.status).toBe(401);
  });

  it("deve retornar 204 ao desfavoritar com sucesso", async () => {
    const Favorite = require("../models/Favorite");
    jest
      .spyOn(Favorite, "deleteOne")
      .mockResolvedValueOnce({ deletedCount: 1 });

    const token = makeToken();
    const res = await request(app)
      .delete("/entries/en/fire/unfavorite")
      .set(authHeader(token));

    expect(res.status).toBe(204);
  });

  it("deve retornar 404 quando palavra não estava favoritada", async () => {
    const Favorite = require("../models/Favorite");
    jest
      .spyOn(Favorite, "deleteOne")
      .mockResolvedValueOnce({ deletedCount: 0 });

    const token = makeToken();
    const res = await request(app)
      .delete("/entries/en/fire/unfavorite")
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});

// =============================================================================
// 8. Perfil do usuário
// =============================================================================
describe("GET /user/me", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/user/me");
    expect(res.status).toBe(401);
  });

  it("deve retornar 200 com dados do usuário autenticado", async () => {
    const User = require("../models/User");

    const fakeUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Samuel",
      email: "samuel@email.com",
      createdAt: new Date().toISOString(),
    };

    jest.spyOn(User, "findById").mockReturnValueOnce({
      select: () => Promise.resolve(fakeUser),
    });

    const token = makeToken({ id: fakeUser._id.toString() });
    const res = await request(app).get("/user/me").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("email");
  });
});

// =============================================================================
// 9. Histórico do usuário
// =============================================================================
describe("GET /user/me/history", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/user/me/history");
    expect(res.status).toBe(401);
  });

  it("deve retornar 200 com estrutura de paginação", async () => {
    const History = require("../models/History");

    jest.spyOn(History, "countDocuments").mockResolvedValueOnce(2);
    jest.spyOn(History, "find").mockReturnValueOnce({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            select: () =>
              Promise.resolve([
                { word: "fire", createdAt: new Date() },
                { word: "water", createdAt: new Date() },
              ]),
          }),
        }),
      }),
    });

    const token = makeToken();
    const res = await request(app)
      .get("/user/me/history")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("totalDocs");
    expect(res.body).toHaveProperty("totalPages");
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});

// =============================================================================
// 10. Favoritos do usuário
// =============================================================================
describe("GET /user/me/favorites", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/user/me/favorites");
    expect(res.status).toBe(401);
  });

  it("deve retornar 200 com estrutura de paginação", async () => {
    const Favorite = require("../models/Favorite");

    jest.spyOn(Favorite, "countDocuments").mockResolvedValueOnce(1);
    jest.spyOn(Favorite, "find").mockReturnValueOnce({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            select: () =>
              Promise.resolve([{ word: "fire", createdAt: new Date() }]),
          }),
        }),
      }),
    });

    const token = makeToken();
    const res = await request(app)
      .get("/user/me/favorites")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("totalDocs");
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});

// =============================================================================
// 11. Cursor Base64 - funções utilitárias
// =============================================================================
describe("Cursor Base64 - codificação e decodificação", () => {
  it("deve codificar uma palavra em Base64 corretamente", () => {
    const word = "fireplace";
    const encoded = Buffer.from(word).toString("base64");
    expect(encoded).toBe("ZmlyZXBsYWNl");
  });

  it("deve decodificar um cursor Base64 de volta à palavra original", () => {
    const cursor = "ZmlyZXBsYWNl";
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    expect(decoded).toBe("fireplace");
  });

  it("deve ser idempotente: encode -> decode retorna a palavra original", () => {
    const words = ["fire", "t-shirt", "aaa", "hello-world"];
    words.forEach((word) => {
      const encoded = Buffer.from(word).toString("base64");
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      expect(decoded).toBe(word);
    });
  });
});
