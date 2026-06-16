const mongoose = require("mongoose");

const DictionarySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Índice para ordenação e busca por prefixo na paginação por cursor
DictionarySchema.index({ word: 1 });

module.exports = mongoose.model("Dictionary", DictionarySchema);
