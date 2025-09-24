const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔄 Testando login na API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@polimeros.com',
      password: 'Polimeros@2024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Login bem-sucedido!');
    console.log('📊 Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro no login:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Dados:', error.response.data);
    } else if (error.request) {
      console.log('📊 Erro de rede - servidor não respondeu');
      console.log('💡 Verifique se o backend está rodando em http://localhost:5000');
    } else {
      console.log('📊 Erro:', error.message);
    }
  }
};

// Testar também outras credenciais possíveis
const testMultipleCredentials = async () => {
  const credentials = [
    { email: 'admin@polimeros.com', password: 'Polimeros@2024' },
    { email: 'admin@polimeros.com', password: 'admin123' },
    { email: 'admin@polimeros.com', password: 'polimeros2024' }
  ];

  for (const cred of credentials) {
    console.log(`\n🔐 Testando: ${cred.email} / ${cred.password}`);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', cred, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      console.log('✅ SUCESSO!');
      console.log('🎯 Esta é a credencial correta!');
      break;
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('❌ Credencial inválida');
      } else {
        console.log('❌ Erro:', error.message);
      }
    }
  }
};

console.log('🧪 Iniciando testes de login...');
testMultipleCredentials();