import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';

const getClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Busca por texto
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { cnpj: { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        clients,
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

const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const { name, cnpj, stateRegistration, phone, email, xmlEmail, address } = req.body;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa é obrigatório'
      });
    }

    if (!cnpj || !cnpj.trim()) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ é obrigatório'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Limpeza de dados
    const cleanData = {
      name: name.trim(),
      cnpj: cnpj.replace(/\D/g, ''), // Remove caracteres especiais
      stateRegistration: stateRegistration ? stateRegistration.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '', // Remove caracteres especiais
      email: email.trim().toLowerCase(),
      xmlEmail: xmlEmail ? xmlEmail.trim().toLowerCase() : '',
      address: {
        street: address?.street ? address.street.trim() : '',
        neighborhood: address?.neighborhood ? address.neighborhood.trim() : '',
        zipCode: address?.zipCode ? address.zipCode.replace(/\D/g, '') : '', // Remove caracteres especiais
        city: address?.city ? address.city.trim() : '',
        state: address?.state ? address.state.trim().toUpperCase() : ''
      }
    };

    // Validação de CNPJ
    if (cleanData.cnpj.length !== 14) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ deve ter 14 dígitos'
      });
    }

    // Validação de telefone (se fornecido)
    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone deve ter 10 ou 11 dígitos'
      });
    }

    // Validação de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validação de email XML (se fornecido)
    if (cleanData.xmlEmail && !emailRegex.test(cleanData.xmlEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email XML inválido'
      });
    }

    // Validação de CEP (se fornecido)
    if (cleanData.address.zipCode && cleanData.address.zipCode.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'CEP deve ter 8 dígitos'
      });
    }

    const client = new Client(cleanData);
    await client.save();

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: { client }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, cnpj, stateRegistration, phone, email, xmlEmail, address } = req.body;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa é obrigatório'
      });
    }

    if (!cnpj || !cnpj.trim()) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ é obrigatório'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Limpeza de dados
    const cleanData = {
      name: name.trim(),
      cnpj: cnpj.replace(/\D/g, ''), // Remove caracteres especiais
      stateRegistration: stateRegistration ? stateRegistration.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '', // Remove caracteres especiais
      email: email.trim().toLowerCase(),
      xmlEmail: xmlEmail ? xmlEmail.trim().toLowerCase() : '',
      address: {
        street: address?.street ? address.street.trim() : '',
        neighborhood: address?.neighborhood ? address.neighborhood.trim() : '',
        zipCode: address?.zipCode ? address.zipCode.replace(/\D/g, '') : '', // Remove caracteres especiais
        city: address?.city ? address.city.trim() : '',
        state: address?.state ? address.state.trim().toUpperCase() : ''
      }
    };

    // Validação de CNPJ
    if (cleanData.cnpj.length !== 14) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ deve ter 14 dígitos'
      });
    }

    // Validação de telefone (se fornecido)
    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone deve ter 10 ou 11 dígitos'
      });
    }

    // Validação de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validação de email XML (se fornecido)
    if (cleanData.xmlEmail && !emailRegex.test(cleanData.xmlEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email XML inválido'
      });
    }

    // Validação de CEP (se fornecido)
    if (cleanData.address.zipCode && cleanData.address.zipCode.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'CEP deve ter 8 dígitos'
      });
    }

    const client = await Client.findByIdAndUpdate(id, cleanData, { 
      new: true, 
      runValidators: true 
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: { client }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
