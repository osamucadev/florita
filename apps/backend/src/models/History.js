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
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Só precisamos saber quando foi criado
  },
);

// Índice composto: melhora a performance ao buscar o histórico de um usuário específico
HistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("History", HistorySchema);
