import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    // Usar MONGO_URI como variável principal, com fallbacks
    const mongoURI = process.env.MONGO_URI || 
                     process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/polymer-order-flow';
    
    console.log('🔄 Tentando conectar ao MongoDB...');
    
    // Configurações otimizadas para MongoDB Atlas
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 segundos para Atlas
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      // Configurações específicas para Atlas
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB conectado com sucesso');
    console.log(`📍 Conectado ao MongoDB Atlas`);
  } catch (error) {
    console.error('❌ Falha na conexão com MongoDB');
    console.error('💡 Dicas para resolver:');
    console.error('   - Verifique se a URI do MongoDB Atlas está correta');
    console.error('   - Confirme se o usuário e senha estão corretos');
    console.error('   - Verifique se o IP está liberado no MongoDB Atlas');
    console.error('   - Configure MONGO_URI no arquivo .env');
    console.error('   - Exemplo: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
    
    // Log do erro técnico apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('🔧 Erro técnico:', (error as Error).message);
    }
    
    // Não encerrar o processo, permitir que o servidor continue rodando
    console.warn('⚠️  Servidor continuará rodando sem conexão com o banco de dados');
  }
};

// Eventos de conexão do Mongoose
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado ao MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão do Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado do MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconectado ao MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Conexão MongoDB fechada devido ao encerramento da aplicação');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', (error as Error).message);
  }
  process.exit(0);
});

export default connectDB;