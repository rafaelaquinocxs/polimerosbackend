import { Request, Response, NextFunction } from 'express';
declare const getClients: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getClientById: (req: any, res: any, next: any) => Promise<any>;
declare const createClient: (req: any, res: any, next: any) => Promise<any>;
declare const updateClient: (req: any, res: any, next: any) => Promise<any>;
declare const deleteClient: (req: any, res: any, next: any) => Promise<any>;
export { getClients, getClientById, createClient, updateClient, deleteClient };
//# sourceMappingURL=clientController.d.ts.map