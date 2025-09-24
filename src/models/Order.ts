import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  client: string;
  representative: string;
  carrier: string;
  orderDate: Date;
  paymentConditions: string;
  status: string;
  observations?: string;
  items: IOrderItem[];
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Produto é obrigatório']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantidade é obrigatória'],
    min: [0.01, 'Quantidade deve ser maior que zero']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Preço unitário é obrigatório'],
    min: [0, 'Preço unitário deve ser maior ou igual a zero']
  }
});

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Cliente é obrigatório']
  },
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'Representative',
    required: [true, 'Representada é obrigatória']
  },
  carrier: {
    type: Schema.Types.ObjectId,
    ref: 'Carrier',
    required: [true, 'Transportadora é obrigatória']
  },
  orderDate: {
    type: Date,
    required: [true, 'Data do pedido é obrigatória'],
    default: Date.now
  },
  paymentConditions: {
    type: String,
    required: [true, 'Condições de pagamento são obrigatórias'],
    trim: true,
    maxlength: [100, 'Condições de pagamento não podem ter mais de 100 caracteres']
  },
  status: {
    type: String,
    required: [true, 'Status é obrigatório'],
    enum: ['Pendente', 'Confirmado', 'Em Produção', 'Enviado', 'Entregue', 'Cancelado'],
    default: 'Pendente'
  },
  observations: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem ter mais de 500 caracteres']
  },
  items: [OrderItemSchema],
  totalValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calcular valor total antes de salvar
OrderSchema.pre<IOrder>('save', function (next) {
  if (Array.isArray(this.items) && this.items.length > 0) {
    this.totalValue = this.items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  }
  next();
});

// Índices para otimização de busca
OrderSchema.index({ client: 1, orderDate: -1 });
OrderSchema.index({ representative: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderNumber: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
