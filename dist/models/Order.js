"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const OrderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Cliente é obrigatório']
    },
    representative: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Representative',
        required: [true, 'Representada é obrigatória']
    },
    carrier: {
        type: mongoose_1.Schema.Types.ObjectId,
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
OrderSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalValue = this.items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }
    next();
});
OrderSchema.index({ client: 1, orderDate: -1 });
OrderSchema.index({ representative: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderNumber: 1 });
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map