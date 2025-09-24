import mongoose, { Document } from 'mongoose';
export interface IClient extends Document {
    name: string;
    cnpj: string;
    stateRegistration?: string;
    phone?: string;
    email: string;
    xmlEmail?: string;
    address?: {
        street?: string;
        neighborhood?: string;
        zipCode?: string;
        city?: string;
        state?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, {}> & IClient & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Client.d.ts.map