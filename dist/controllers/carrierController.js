"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCarrier = exports.updateCarrier = exports.createCarrier = exports.getCarrierById = exports.getCarriers = void 0;
const Carrier_1 = __importDefault(require("../models/Carrier"));
const getCarriers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { contact: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const carriers = await Carrier_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Carrier_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: {
                carriers,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCarriers = getCarriers;
const getCarrierById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const carrier = await Carrier_1.default.findById(id);
        if (!carrier) {
            return res.status(404).json({
                success: false,
                message: 'Transportadora não encontrada'
            });
        }
        res.status(200).json({
            success: true,
            data: { carrier }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCarrierById = getCarrierById;
const createCarrier = async (req, res, next) => {
    try {
        const { name, contact, phone, email, freightMode } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nome da transportadora é obrigatório'
            });
        }
        const cleanData = {
            name: name.trim(),
            contact: contact ? contact.trim() : '',
            phone: phone ? phone.replace(/\D/g, '') : '',
            email: email ? email.trim().toLowerCase() : '',
            freightMode: freightMode || 'CIF'
        };
        if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
            return res.status(400).json({
                success: false,
                message: 'Telefone deve ter 10 ou 11 dígitos'
            });
        }
        if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }
        const carrier = new Carrier_1.default(cleanData);
        await carrier.save();
        res.status(201).json({
            success: true,
            message: 'Transportadora criada com sucesso',
            data: { carrier }
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        next(error);
    }
};
exports.createCarrier = createCarrier;
const updateCarrier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, contact, phone, email, freightMode } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nome da transportadora é obrigatório'
            });
        }
        const cleanData = {
            name: name.trim(),
            contact: contact ? contact.trim() : '',
            phone: phone ? phone.replace(/\D/g, '') : '',
            email: email ? email.trim().toLowerCase() : '',
            freightMode: freightMode || 'CIF'
        };
        if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
            return res.status(400).json({
                success: false,
                message: 'Telefone deve ter 10 ou 11 dígitos'
            });
        }
        if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }
        const carrier = await Carrier_1.default.findByIdAndUpdate(id, cleanData, {
            new: true,
            runValidators: true
        });
        if (!carrier) {
            return res.status(404).json({
                success: false,
                message: 'Transportadora não encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Transportadora atualizada com sucesso',
            data: { carrier }
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        next(error);
    }
};
exports.updateCarrier = updateCarrier;
const deleteCarrier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const carrier = await Carrier_1.default.findByIdAndDelete(id);
        if (!carrier) {
            return res.status(404).json({
                success: false,
                message: 'Transportadora não encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Transportadora excluída com sucesso'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCarrier = deleteCarrier;
//# sourceMappingURL=carrierController.js.map