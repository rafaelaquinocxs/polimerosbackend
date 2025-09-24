"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res, next) => {
    try {
        const { search, representative, page = 1, limit = 10 } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (representative) {
            query.representative = representative;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const products = await Product_1.default.find(query)
            .populate('representative', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Product_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: {
                products,
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
exports.getProducts = getProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id).populate('representative', 'name cnpj contact');
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const product = new Product_1.default(req.body);
        await product.save();
        await product.populate('representative', 'name');
        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('representative', 'name');
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Produto atualizado com sucesso',
            data: { product }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByIdAndDelete(id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Produto excluído com sucesso'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map