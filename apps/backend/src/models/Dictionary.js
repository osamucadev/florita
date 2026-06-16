const mongoose = require("mongoose");

const DictionarySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// Índices:
// - O `unique: true` acima já provê o índice ascendente { word: 1 }, que é
//   exatamente o que a busca por prefixo (range $gte/$lt) e a ordenação
//   alfabética da paginação por cursor utilizam. Por isso NÃO declaramos um
//   { word: 1 } adicional — seria duplicado.
// - O antigo índice de texto { word: "text" } foi removido: a busca passou a
//   ser por prefixo via range, e o índice `text` não casa prefixos (apenas
//   tokens inteiros, com stemming), além de não compor com o cursor.

module.exports = mongoose.model("Dictionary", DictionarySchema);
