import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  unit: string;
  representative: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição do produto é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior que zero']
  },
  unit: {
    type: String,
    required: [true, 'Unidade é obrigatória'],
    trim: true,
    enum: ['KG', 'TON', 'UN', 'M', 'M2', 'M3', 'L'],
    default: 'KG'
  },
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'Representative',
    required: [true, 'Representada é obrigatória']
  }
}, {
  timestamps: true
});

// Índices para otimização de busca
ProductSchema.index({ name: 1 });
ProductSchema.index({ representative: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
