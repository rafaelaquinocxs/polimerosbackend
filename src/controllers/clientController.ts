import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';

const getClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    let query: Record<string, any> = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { cnpj: { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const client = await Client.findById(id);

    if (!client) {
      res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: { client } });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

const createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, cnpj, stateRegistration, phone, email, xmlEmail, address } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Nome da empresa é obrigatório' });
      return;
    }
    if (!cnpj?.trim()) {
      res.status(400).json({ success: false, message: 'CNPJ é obrigatório' });
      return;
    }
    if (!email?.trim()) {
      res.status(400).json({ success: false, message: 'Email é obrigatório' });
      return;
    }

    const cleanData = {
      name: name.trim(),
      cnpj: cnpj.replace(/\D/g, ''),
      stateRegistration: stateRegistration ? stateRegistration.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      email: email.trim().toLowerCase(),
      xmlEmail: xmlEmail ? xmlEmail.trim().toLowerCase() : '',
      address: {
        street: address?.street?.trim() || '',
        neighborhood: address?.neighborhood?.trim() || '',
        zipCode: address?.zipCode ? address.zipCode.replace(/\D/g, '') : '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim().toUpperCase() || ''
      }
    };

    if (cleanData.cnpj.length !== 14) {
      res.status(400).json({ success: false, message: 'CNPJ deve ter 14 dígitos' });
      return;
    }

    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      res.status(400).json({ success: false, message: 'Telefone deve ter 10 ou 11 dígitos' });
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanData.email)) {
      res.status(400).json({ success: false, message: 'Email inválido' });
      return;
    }
    if (cleanData.xmlEmail && !emailRegex.test(cleanData.xmlEmail)) {
      res.status(400).json({ success: false, message: 'Email XML inválido' });
      return;
    }
    if (cleanData.address.zipCode && cleanData.address.zipCode.length !== 8) {
      res.status(400).json({ success: false, message: 'CEP deve ter 8 dígitos' });
      return;
    }

    const client = new Client(cleanData);
    await client.save();

    res.status(201).json({ success: true, message: 'Cliente criado com sucesso', data: { client } });
  } catch (error) {
    const err = error as any;
    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'CNPJ já cadastrado' });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, cnpj, stateRegistration, phone, email, xmlEmail, address } = req.body;

    if (!name?.trim() || !cnpj?.trim() || !email?.trim()) {
      res.status(400).json({ success: false, message: 'Nome, CNPJ e Email são obrigatórios' });
      return;
    }

    const cleanData = {
      name: name.trim(),
      cnpj: cnpj.replace(/\D/g, ''),
      stateRegistration: stateRegistration ? stateRegistration.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      email: email.trim().toLowerCase(),
      xmlEmail: xmlEmail ? xmlEmail.trim().toLowerCase() : '',
      address: {
        street: address?.street?.trim() || '',
        neighborhood: address?.neighborhood?.trim() || '',
        zipCode: address?.zipCode ? address.zipCode.replace(/\D/g, '') : '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim().toUpperCase() || ''
      }
    };

    if (cleanData.cnpj.length !== 14) {
      res.status(400).json({ success: false, message: 'CNPJ deve ter 14 dígitos' });
      return;
    }
    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      res.status(400).json({ success: false, message: 'Telefone deve ter 10 ou 11 dígitos' });
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanData.email)) {
      res.status(400).json({ success: false, message: 'Email inválido' });
      return;
    }
    if (cleanData.xmlEmail && !emailRegex.test(cleanData.xmlEmail)) {
      res.status(400).json({ success: false, message: 'Email XML inválido' });
      return;
    }
    if (cleanData.address.zipCode && cleanData.address.zipCode.length !== 8) {
      res.status(400).json({ success: false, message: 'CEP deve ter 8 dígitos' });
      return;
    }

    const client = await Client.findByIdAndUpdate(id, cleanData, { new: true, runValidators: true });

    if (!client) {
      res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cliente atualizado com sucesso', data: { client } });
  } catch (error) {
    const err = error as any;
    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'CNPJ já cadastrado' });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
