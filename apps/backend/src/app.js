const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3333;

connectDB();

app.use(cors());
app.use(express.json());

app.use(routes);

app.listen(PORT, () => {
  console.log(`🌸 Florita API rodando com sucesso na porta ${PORT}!`);
});
