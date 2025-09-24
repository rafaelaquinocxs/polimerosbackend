import { Request, Response, NextFunction } from 'express';
import Representative from '../models/Representative';

export const getRepresentatives = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Busca por texto
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { cnpj: { $regex: search, $options: 'i' } },
          { contact: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const representatives = await Representative.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Representative.countDocuments(query);

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
  } catch (error) {
    next(error);
  }
};

export const getRepresentativeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const representative = await Representative.findById(id);
    
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
  } catch (error) {
    next(error);
  }
};

export const createRepresentative = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, cnpj, contact, phone, email } = req.body;

    // Validações básicas
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

    // Limpar CNPJ (remover caracteres especiais)
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      res.status(400).json({
        success: false,
        message: 'CNPJ deve ter 14 dígitos'
      });
      return;
    }

    // Verificar se CNPJ já existe
    const existingRepresentative = await Representative.findOne({ cnpj: cleanCnpj });
    if (existingRepresentative) {
      res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
      return;
    }

    // Validar email se fornecido
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

    // Validar telefone se fornecido
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

    // Criar representada com dados limpos
    const representativeData = {
      name: name.trim(),
      cnpj: cleanCnpj,
      contact: contact ? contact.trim() : undefined,
      phone: phone ? phone.replace(/\D/g, '') : undefined,
      email: email ? email.trim().toLowerCase() : undefined
    };

    const representative = new Representative(representativeData);
    await representative.save();

    res.status(201).json({
      success: true,
      message: 'Representada criada com sucesso',
      data: { representative }
    });
  } catch (error) {
    next(error);
  }
};

export const updateRepresentative = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, cnpj, contact, phone, email } = req.body;

    // Validações básicas
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

    // Limpar CNPJ
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      res.status(400).json({
        success: false,
        message: 'CNPJ deve ter 14 dígitos'
      });
      return;
    }

    // Verificar se CNPJ já existe (exceto para a própria representada)
    const existingRepresentative = await Representative.findOne({ 
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

    // Validar email se fornecido
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

    // Validar telefone se fornecido
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

    // Preparar dados para atualização
    const updateData = {
      name: name.trim(),
      cnpj: cleanCnpj,
      contact: contact ? contact.trim() : undefined,
      phone: phone ? phone.replace(/\D/g, '') : undefined,
      email: email ? email.trim().toLowerCase() : undefined
    };
    
    const representative = await Representative.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
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
  } catch (error) {
    next(error);
  }
};

export const deleteRepresentative = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const representative = await Representative.findByIdAndDelete(id);
    
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
  } catch (error) {
    next(error);
  }
};