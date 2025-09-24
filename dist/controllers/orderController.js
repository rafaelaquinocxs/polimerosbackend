"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const getOrders = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};
        if (status && status !== 'Todos') {
            query.status = status;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let orders;
        if (search) {
            orders = await Order_1.default.aggregate([
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'client',
                        foreignField: '_id',
                        as: 'clientData'
                    }
                },
                {
                    $match: {
                        $and: [
                            query,
                            {
                                $or: [
                                    { orderNumber: { $regex: search, $options: 'i' } },
                                    { 'clientData.name': { $regex: search, $options: 'i' } }
                                ]
                            }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'representatives',
                        localField: 'representative',
                        foreignField: '_id',
                        as: 'representative'
                    }
                },
                {
                    $lookup: {
                        from: 'carriers',
                        localField: 'carrier',
                        foreignField: '_id',
                        as: 'carrier'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                {
                    $addFields: {
                        client: { $arrayElemAt: ['$clientData', 0] },
                        representative: { $arrayElemAt: ['$representative', 0] },
                        carrier: { $arrayElemAt: ['$carrier', 0] }
                    }
                },
                {
                    $project: {
                        clientData: 0,
                        productData: 0
                    }
                }
            ]);
        }
        else {
            orders = await Order_1.default.find(query)
                .populate('client', 'name cnpj')
                .populate('representative', 'name')
                .populate('carrier', 'name')
                .populate('items.product', 'name unit')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);
        }
        const total = await Order_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: {
                orders,
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
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order_1.default.findById(id)
            .populate('client')
            .populate('representative')
            .populate('carrier')
            .populate('items.product');
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res, next) => {
    try {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `PED${timestamp.slice(-6)}${random}`;
        const orderData = {
            ...req.body,
            orderNumber
        };
        console.log('Criando pedido com dados:', orderData);
        const order = new Order_1.default(orderData);
        await order.save();
        await order.populate([
            { path: 'client', select: 'name cnpj' },
            { path: 'representative', select: 'name' },
            { path: 'carrier', select: 'name' },
            { path: 'items.product', select: 'name unit' }
        ]);
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            data: { order }
        });
    }
    catch (error) {
        console.error('Erro ao criar pedido:', error);
        next(error);
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate([
            { path: 'client', select: 'name cnpj' },
            { path: 'representative', select: 'name' },
            { path: 'carrier', select: 'name' },
            { path: 'items.product', select: 'name unit' }
        ]);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Pedido atualizado com sucesso',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order_1.default.findByIdAndDelete(id);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Pedido excluído com sucesso'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrder = deleteOrder;
const getDashboardStats = async (req, res, next) => {
    try {
        const totalClients = await Order_1.default.distinct('client').then(clients => clients.length);
        const totalProducts = await Order_1.default.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product' } },
            { $count: 'total' }
        ]).then(result => result[0]?.total || 0);
        const pendingOrders = await Order_1.default.countDocuments({ status: 'Pendente' });
        const billedOrders = await Order_1.default.countDocuments({ status: 'Faturado' });
        const pendingValue = await Order_1.default.aggregate([
            { $match: { status: 'Pendente' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]).then(result => result[0]?.total || 0);
        const billedValue = await Order_1.default.aggregate([
            { $match: { status: 'Faturado' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]).then(result => result[0]?.total || 0);
        const totalOrders = pendingOrders + billedOrders;
        const totalValue = pendingValue + billedValue;
        const billingRate = totalOrders > 0 ? (billedOrders / totalOrders) * 100 : 0;
        res.status(200).json({
            success: true,
            data: {
                totalClients,
                totalProducts,
                pendingOrders,
                billedOrders,
                pendingValue,
                billedValue,
                totalOrders,
                totalValue,
                billingRate: Math.round(billingRate * 100) / 100
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=orderController.js.map