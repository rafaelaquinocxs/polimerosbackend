import { Request, Response, NextFunction } from 'express';
export declare const getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDashboardStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map