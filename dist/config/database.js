"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI ||
            process.env.MONGODB_URI ||
            'mongodb://localhost:27017/polymer-order-flow';
        console.log('🔄 Tentando conectar ao MongoDB...');
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ MongoDB conectado com sucesso');
        console.log(`📍 Conectado ao MongoDB Atlas`);
    }
    catch (error) {
        console.error('❌ Falha na conexão com MongoDB');
        console.error('💡 Dicas para resolver:');
        console.error('   - Verifique se a URI do MongoDB Atlas está correta');
        console.error('   - Confirme se o usuário e senha estão corretos');
        console.error('   - Verifique se o IP está liberado no MongoDB Atlas');
        console.error('   - Configure MONGO_URI no arquivo .env');
        console.error('   - Exemplo: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
        if (process.env.NODE_ENV === 'development') {
            console.error('🔧 Erro técnico:', error.message);
        }
        console.warn('⚠️  Servidor continuará rodando sem conexão com o banco de dados');
    }
};
mongoose_1.default.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado ao MongoDB Atlas');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ Erro na conexão do Mongoose:', err.message);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('🔌 Mongoose desconectado do MongoDB');
});
mongoose_1.default.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconectado ao MongoDB');
});
process.on('SIGINT', async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log('🛑 Conexão MongoDB fechada devido ao encerramento da aplicação');
    }
    catch (error) {
        console.error('❌ Erro ao fechar conexão:', error.message);
    }
    process.exit(0);
});
exports.default = connectDB;
//# sourceMappingURL=database.js.map