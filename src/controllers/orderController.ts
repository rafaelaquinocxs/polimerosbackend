import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    let query: any = {};
    
    // Filtro por status
    if (status && status !== 'Todos') {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let orders;
    
    if (search) {
      // Busca por número do pedido ou nome do cliente
      orders = await Order.aggregate([
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
    } else {
      orders = await Order.find(query)
        .populate('client', 'name cnpj')
        .populate('representative', 'name')
        .populate('carrier', 'name')
        .populate('items.product', 'name unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    }

    const total = await Order.countDocuments(query);

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
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
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
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // CORREÇÃO: Gerar orderNumber único antes de criar
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `PED${timestamp.slice(-6)}${random}`;
    
    // Adicionar orderNumber aos dados
    const orderData = {
      ...req.body,
      orderNumber
    };
    
    console.log('Criando pedido com dados:', orderData);
    
    const order = new Order(orderData);
    await order.save();
    
    // Populate para retornar dados completos
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
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
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
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByIdAndDelete(id);
    
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
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Estatísticas do dashboard
    const totalClients = await Order.distinct('client').then(clients => clients.length);
    const totalProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product' } },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);
    
    const pendingOrders = await Order.countDocuments({ status: 'Pendente' });
    const billedOrders = await Order.countDocuments({ status: 'Faturado' });
    
    // Valores dos pedidos
    const pendingValue = await Order.aggregate([
      { $match: { status: 'Pendente' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).then(result => result[0]?.total || 0);
    
    const billedValue = await Order.aggregate([
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
  } catch (error) {
    next(error);
  }
};