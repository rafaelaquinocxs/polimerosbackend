import { Request, Response, NextFunction } from 'express';
declare const getCarriers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getCarrierById: (req: any, res: any, next: any) => Promise<any>;
declare const createCarrier: (req: any, res: any, next: any) => Promise<any>;
declare const updateCarrier: (req: any, res: any, next: any) => Promise<any>;
declare const deleteCarrier: (req: any, res: any, next: any) => Promise<any>;
export { getCarriers, getCarrierById, createCarrier, updateCarrier, deleteCarrier };
//# sourceMappingURL=carrierController.d.ts.map