import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, representative, page = 1, limit = 10 } = req.query;
    
    let query: any = {};
    
    // Busca por texto
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por representada
    if (representative) {
      query.representative = representative;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate('representative', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

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
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate('representative', 'name cnpj contact');
    
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
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Populate para retornar dados completos
    await product.populate('representative', 'name');

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('representative', 'name');
    
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
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
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
  } catch (error) {
    next(error);
  }
};
