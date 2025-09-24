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
const RepresentativeSchema = new mongoose_1.Schema({
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
            validator: function (cnpj) {
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
            validator: function (phone) {
                if (!phone)
                    return true;
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
            validator: function (email) {
                if (!email)
                    return true;
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Email inválido'
        }
    }
}, {
    timestamps: true
});
RepresentativeSchema.index({ name: 1 });
RepresentativeSchema.index({ cnpj: 1 });
exports.default = mongoose_1.default.model('Representative', RepresentativeSchema);
//# sourceMappingURL=Representative.js.map