const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Índice composto: Busca ultra veloz do histórico por usuário ordenado pelo mais recente
HistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("History", HistorySchema);
