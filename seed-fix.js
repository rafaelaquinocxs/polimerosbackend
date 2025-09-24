const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Schema do usuário (copiado exatamente do sistema)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);

const createUser = async () => {
  try {
    // Conectar ao banco
    const mongoURI = process.env.MONGO_URI || 
                     process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/polymer-order-flow';
    
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB');

    // Remover usuário existente se houver
    await User.deleteOne({ email: 'admin@polimeros.com' });
    console.log('🧹 Usuário existente removido (se havia)');

    // Criar novo usuário
    console.log('👤 Criando usuário administrador...');
    
    const userData = {
      name: 'Administrador do Sistema',
      email: 'admin@polimeros.com',
      password: 'Polimeros@2024'
    };

    const user = new User(userData);
    await user.save();
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('🔐 CREDENCIAIS PARA LOGIN:');
    console.log('📧 Email: admin@polimeros.com');
    console.log('🔑 Senha: Polimeros@2024');
    console.log('');

    // Verificar se foi salvo corretamente
    const savedUser = await User.findOne({ email: 'admin@polimeros.com' });
    if (savedUser) {
      console.log('✅ Verificação: Usuário encontrado no banco');
      console.log(`   Nome: ${savedUser.name}`);
      console.log(`   Email: ${savedUser.email}`);
      
      // Testar senha
      const isValidPassword = await bcrypt.compare('Polimeros@2024', savedUser.password);
      console.log(`   Senha válida: ${isValidPassword ? '✅ SIM' : '❌ NÃO'}`);
    } else {
      console.log('❌ Erro: Usuário não foi encontrado após criação!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
};

createUser();