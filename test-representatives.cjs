const mongoose = require('mongoose');
require('dotenv').config();

// Importar o modelo corrigido
const Representative = require('./src/models/Representative');

const testRepresentative = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    
    const mongoURI = process.env.MONGO_URI || 
                     process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/polymer-order-flow';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB');

    // Testar criação de representada
    console.log('\n🧪 Testando criação de representada...');
    
    const testData = {
      name: 'Teste Representada Ltda',
      cnpj: '12345678000195', // Apenas números
      contact: 'João Silva',
      phone: '11999887766', // Apenas números
      email: 'teste@representada.com'
    };

    console.log('📤 Dados:', JSON.stringify(testData, null, 2));

    // Remover representada de teste se existir
    await Representative.deleteOne({ cnpj: testData.cnpj });

    // Criar nova representada
    const representative = new Representative(testData);
    await representative.save();

    console.log('✅ Representada criada com sucesso!');
    console.log('📊 Resultado:', JSON.stringify(representative, null, 2));

    // Testar busca
    console.log('\n🔍 Testando busca...');
    const found = await Representative.findOne({ cnpj: testData.cnpj });
    console.log('✅ Representada encontrada:', found.name);

    // Limpar teste
    await Representative.deleteOne({ cnpj: testData.cnpj });
    console.log('🧹 Dados de teste removidos');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.errors) {
      console.error('📋 Detalhes dos erros:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

testRepresentative();