const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // Validação severa de e-mail na camada do banco
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor, insira um e-mail válido.",
      ],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// HOOK PRE-SAVE: Criptografia automática de senha antes de salvar no banco
UserSchema.pre("save", async function (next) {
  // Só gera o hash se a senha tiver sido modificada (ou for nova)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// MÉTODO AUXILIAR: Facilita a comparação de senhas dentro do AuthController
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Índice para login por e-mail (Opcional por conta do unique, mas ótimo para documentar intenção)
UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
