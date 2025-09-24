import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  cnpj: string;
  stateRegistration?: string;
  phone?: string;
  email: string;
  xmlEmail?: string;
  address?: {
    street?: string;
    neighborhood?: string;
    zipCode?: string;
    city?: string;
    state?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome da empresa é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
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
  stateRegistration: {
    type: String,
    trim: true,
    maxlength: [20, 'Inscrição Estadual não pode ter mais de 20 caracteres']
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
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        // Validação básica de email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Email inválido'
    }
  },
  xmlEmail: {
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
      message: 'Email XML inválido'
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Endereço não pode ter mais de 200 caracteres']
    },
    neighborhood: {
      type: String,
      trim: true,
      maxlength: [100, 'Bairro não pode ter mais de 100 caracteres']
    },
    zipCode: {
      type: String,
      trim: true,
      validate: {
        validator: function(zipCode: string) {
          // Se zipCode estiver vazio, é válido (campo opcional)
          if (!zipCode) return true;
          // Aceitar apenas números (8 dígitos)
          return /^\d{8}$/.test(zipCode);
        },
        message: 'CEP deve conter exatamente 8 dígitos'
      }
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'Cidade não pode ter mais de 100 caracteres']
    },
    state: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
    }
  }
}, {
  timestamps: true
});

// Índices para otimização de busca
ClientSchema.index({ name: 1 });
ClientSchema.index({ cnpj: 1 });

export default mongoose.model<IClient>('Client', ClientSchema);
