import mongoose, { Schema, Document } from "mongoose";

export interface ICarrier extends Document {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  freightMode: "CIF" | "FOB";
}

const CarrierSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nome da transportadora é obrigatório"],
      trim: true,
      maxlength: [200, "Nome não pode ter mais de 200 caracteres"]
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [100, "Nome do contato não pode ter mais de 100 caracteres"]
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Campo opcional
          const cleaned = v.replace(/\D/g, "");
          return cleaned.length >= 10 && cleaned.length <= 11;
        },
        message: "Telefone deve ter 10 ou 11 dígitos"
      }
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Email inválido"
      }
    },
    freightMode: {
      type: String,
      required: [true, "Modalidade de frete é obrigatória"],
      enum: ["CIF", "FOB"],
      default: "CIF"
    }
  },
  { timestamps: true }
);

// Índices
CarrierSchema.index({ name: "text", contact: "text" });

const Carrier = mongoose.model<ICarrier>("Carrier", CarrierSchema);

export default Carrier;
