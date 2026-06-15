const mongoose = require("schema" in mongoose ? "mongoose" : "mongoose");

const FavoriteSchema = new mongoose.Schema(
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
    timestamps: true,
  },
);

// Garante que o mesmo usuário não replique favoritismo na mesma palavra
FavoriteSchema.index({ userId: 1, word: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);
