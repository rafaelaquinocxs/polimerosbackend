"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRepresentative = exports.updateRepresentative = exports.createRepresentative = exports.getRepresentativeById = exports.getRepresentatives = void 0;
const Representative_1 = __importDefault(require("../models/Representative"));
const getRepresentatives = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { cnpj: { $regex: search, $options: 'i' } },
                    { contact: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const representatives = await Representative_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Representative_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: {
                representatives,
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
exports.getRepresentatives = getRepresentatives;
const getRepresentativeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const representative = await Representative_1.default.findById(id);
        if (!representative) {
            res.status(404).json({
                success: false,
                message: 'Representada não encontrada'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { representative }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRepresentativeById = getRepresentativeById;
const createRepresentative = async (req, res, next) => {
    try {
        const { name, cnpj, contact, phone, email } = req.body;
        if (!name || !name.trim()) {
            res.status(400).json({
                success: false,
                message: 'Nome da empresa é obrigatório'
            });
            return;
        }
        if (!cnpj || !cnpj.trim()) {
            res.status(400).json({
                success: false,
                message: 'CNPJ é obrigatório'
            });
            return;
        }
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) {
            res.status(400).json({
                success: false,
                message: 'CNPJ deve ter 14 dígitos'
            });
            return;
        }
        const existingRepresentative = await Representative_1.default.findOne({ cnpj: cleanCnpj });
        if (existingRepresentative) {
            res.status(400).json({
                success: false,
                message: 'CNPJ já cadastrado'
            });
            return;
        }
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
                return;
            }
        }
        if (phone && phone.trim()) {
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                res.status(400).json({
                    success: false,
                    message: 'Telefone deve ter 10 ou 11 dígitos'
                });
                return;
            }
        }
        const representativeData = {
            name: name.trim(),
            cnpj: cleanCnpj,
            contact: contact ? contact.trim() : undefined,
            phone: phone ? phone.replace(/\D/g, '') : undefined,
            email: email ? email.trim().toLowerCase() : undefined
        };
        const representative = new Representative_1.default(representativeData);
        await representative.save();
        res.status(201).json({
            success: true,
            message: 'Representada criada com sucesso',
            data: { representative }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRepresentative = createRepresentative;
const updateRepresentative = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, cnpj, contact, phone, email } = req.body;
        if (!name || !name.trim()) {
            res.status(400).json({
                success: false,
                message: 'Nome da empresa é obrigatório'
            });
            return;
        }
        if (!cnpj || !cnpj.trim()) {
            res.status(400).json({
                success: false,
                message: 'CNPJ é obrigatório'
            });
            return;
        }
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) {
            res.status(400).json({
                success: false,
                message: 'CNPJ deve ter 14 dígitos'
            });
            return;
        }
        const existingRepresentative = await Representative_1.default.findOne({
            cnpj: cleanCnpj,
            _id: { $ne: id }
        });
        if (existingRepresentative) {
            res.status(400).json({
                success: false,
                message: 'CNPJ já cadastrado'
            });
            return;
        }
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
                return;
            }
        }
        if (phone && phone.trim()) {
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                res.status(400).json({
                    success: false,
                    message: 'Telefone deve ter 10 ou 11 dígitos'
                });
                return;
            }
        }
        const updateData = {
            name: name.trim(),
            cnpj: cleanCnpj,
            contact: contact ? contact.trim() : undefined,
            phone: phone ? phone.replace(/\D/g, '') : undefined,
            email: email ? email.trim().toLowerCase() : undefined
        };
        const representative = await Representative_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!representative) {
            res.status(404).json({
                success: false,
                message: 'Representada não encontrada'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Representada atualizada com sucesso',
            data: { representative }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRepresentative = updateRepresentative;
const deleteRepresentative = async (req, res, next) => {
    try {
        const { id } = req.params;
        const representative = await Representative_1.default.findByIdAndDelete(id);
        if (!representative) {
            res.status(404).json({
                success: false,
                message: 'Representada não encontrada'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Representada excluída com sucesso'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRepresentative = deleteRepresentative;
//# sourceMappingURL=representativeController.js.map