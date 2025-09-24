import { Request, Response, NextFunction } from 'express';
import Carrier from '../models/Carrier';

const getCarriers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    let query: Record<string, any> = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { contact: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;

    const carriers = await Carrier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Carrier.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        carriers,
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

const getCarrierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const carrier = await Carrier.findById(id);

    if (!carrier) {
      res.status(404).json({ success: false, message: 'Transportadora não encontrada' });
      return;
    }

    res.status(200).json({ success: true, data: { carrier } });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCarrier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, contact, phone, email, freightMode } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Nome da transportadora é obrigatório' });
      return;
    }

    const cleanData = {
      name: name.trim(),
      contact: contact ? contact.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      email: email ? email.trim().toLowerCase() : '',
      freightMode: freightMode || 'CIF'
    };

    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      res.status(400).json({ success: false, message: 'Telefone deve ter 10 ou 11 dígitos' });
      return;
    }

    if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
      res.status(400).json({ success: false, message: 'Email inválido' });
      return;
    }

    const carrier = new Carrier(cleanData);
    await carrier.save();

    res.status(201).json({
      success: true,
      message: 'Transportadora criada com sucesso',
      data: { carrier }
    });
  } catch (error) {
    const err = error as Error & { errors?: Record<string, any> };
    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCarrier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, contact, phone, email, freightMode } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Nome da transportadora é obrigatório' });
      return;
    }

    const cleanData = {
      name: name.trim(),
      contact: contact ? contact.trim() : '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      email: email ? email.trim().toLowerCase() : '',
      freightMode: freightMode || 'CIF'
    };

    if (cleanData.phone && (cleanData.phone.length < 10 || cleanData.phone.length > 11)) {
      res.status(400).json({ success: false, message: 'Telefone deve ter 10 ou 11 dígitos' });
      return;
    }

    if (cleanData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(cleanData.email)) {
      res.status(400).json({ success: false, message: 'Email inválido' });
      return;
    }

    const carrier = await Carrier.findByIdAndUpdate(id, cleanData, { new: true, runValidators: true });

    if (!carrier) {
      res.status(404).json({ success: false, message: 'Transportadora não encontrada' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transportadora atualizada com sucesso',
      data: { carrier }
    });
  } catch (error) {
    const err = error as Error & { errors?: Record<string, any> };
    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCarrier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const carrier = await Carrier.findByIdAndDelete(id);

    if (!carrier) {
      res.status(404).json({ success: false, message: 'Transportadora não encontrada' });
      return;
    }

    res.status(200).json({ success: true, message: 'Transportadora excluída com sucesso' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getCarriers,
  getCarrierById,
  createCarrier,
  updateCarrier,
  deleteCarrier
};
