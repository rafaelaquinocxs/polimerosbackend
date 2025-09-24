import mongoose, { Document, Schema } from 'mongoose';

export interface IRepresentative extends Document {
  name: string;
  cnpj: string;
  contact?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepresentativeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome da empresa é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  cnpj: {
    type: String,
    required: [true, 'CNPJ é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(cnpj: string) {
        // Aceitar apenas números (sem máscara)
        return /^\d{14}$/.test(cnpj);
      },
      message: 'CNPJ deve conter exatamente 14 dígitos'
    }
  },
  contact: {
    type: String,
    trim: true,
    maxlength: [100, 'Nome do contato não pode ter mais de 100 caracteres']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone: string) {
        // Se phone estiver vazio, é válido (campo opcional)
        if (!phone) return true;
        // Aceitar apenas números (10 ou 11 dígitos)
        return /^\d{10,11}$/.test(phone);
      },
      message: 'Telefone deve conter 10 ou 11 dígitos'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        // Se email estiver vazio, é válido (campo opcional)
        if (!email) return true;
        // Validação básica de email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Email inválido'
    }
  }
}, {
  timestamps: true
});

// Índices para otimização de busca
RepresentativeSchema.index({ name: 1 });
RepresentativeSchema.index({ cnpj: 1 });

export default mongoose.model<IRepresentative>('Representative', RepresentativeSchema);