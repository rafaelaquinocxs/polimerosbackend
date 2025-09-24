import { Request, Response, NextFunction } from 'express';
import Carrier from '../models/Carrier';

const getCarriers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Busca por texto
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

    const carriers = await Carrier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Carrier.countDocuments(query);

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
  } catch (error) {
    next(error);
  }
};

const getCarrierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const carrier = await Carrier.findById(id);

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
  } catch (error) {
    next(error);
  }
};

const createCarrier = async (req, res, next) => {
  try {
    const { name, contact, phone, email, freightMode } = req.body;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da transportadora é obrigatório'
      });
    }

    // Limpeza de dados
    const cleanData = {
      name: name.trim(),
      contact: contact ? contact.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '', // Remove caracteres especiais
      email: email ? email.trim().toLowerCase() : '',
      freightMode: freightMode || 'CIF'
    };

    // Validação de telefone (se fornecido)
    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone deve ter 10 ou 11 dígitos'
      });
    }

    // Validação de email (se fornecido)
    if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    const carrier = new Carrier(cleanData);
    await carrier.save();

    res.status(201).json({
      success: true,
      message: 'Transportadora criada com sucesso',
      data: { carrier }
    });
  } catch (error) {
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

const updateCarrier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, freightMode } = req.body;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da transportadora é obrigatório'
      });
    }

    // Limpeza de dados
    const cleanData = {
      name: name.trim(),
      contact: contact ? contact.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '', // Remove caracteres especiais
      email: email ? email.trim().toLowerCase() : '',
      freightMode: freightMode || 'CIF'
    };

    // Validação de telefone (se fornecido)
    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone deve ter 10 ou 11 dígitos'
      });
    }

    // Validação de email (se fornecido)
    if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    const carrier = await Carrier.findByIdAndUpdate(id, cleanData, { 
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
  } catch (error) {
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

const deleteCarrier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const carrier = await Carrier.findByIdAndDelete(id);

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
  } catch (error) {
    next(error);
  }
};

export {
  getCarriers,
  getCarrierById,
  createCarrier,
  updateCarrier,
  deleteCarrier
};
