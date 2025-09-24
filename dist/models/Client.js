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
const ClientSchema = new mongoose_1.Schema({
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
            validator: function (cnpj) {
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
        required: [true, 'Email é obrigatório'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (email) {
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
            validator: function (email) {
                if (!email)
                    return true;
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
                validator: function (zipCode) {
                    if (!zipCode)
                        return true;
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
ClientSchema.index({ name: 1 });
ClientSchema.index({ cnpj: 1 });
exports.default = mongoose_1.default.model('Client', ClientSchema);
//# sourceMappingURL=Client.js.map