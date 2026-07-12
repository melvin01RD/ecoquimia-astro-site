// test-api.js - Script para probar el endpoint localmente

// PASO 1: Crea un archivo .env en la raíz del proyecto con:
// RESEND_API_KEY=tu_api_key_aqui

// PASO 2: Ejecuta este script con:
// node test-api.js

import { Resend } from 'resend';

async function testEmail() {
  console.log('🧪 Probando conexión con Resend...\n');
  
  try {
    const apiKey = process.env.RESEND_API_KEY || 'COLOCA_TU_API_KEY_AQUI';
    
    if (apiKey === 'COLOCA_TU_API_KEY_AQUI') {
      console.error('❌ Error: No se ha configurado la API key');
      console.log('Configura la variable de entorno RESEND_API_KEY o edita este archivo');
      return;
    }
    
    console.log('📧 Intentando enviar email de prueba...');
    
    const resend = new Resend(apiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'Ecoquimia <onboarding@resend.dev>',
      to: ['areacomercial.eco@gmail.com'],
      subject: '🧪 Email de prueba - Ecoquimia',
      html: `
        <h2>Email de prueba</h2>
        <p>Si recibes este email, la configuración de Resend está funcionando correctamente.</p>
        <p>Fecha: ${new Date().toLocaleString('es-DO')}</p>
      `
    });

    if (error) {
      console.error('❌ Error al enviar:', error);
      console.log('\n📋 Posibles causas:');
      console.log('1. API key incorrecta');
      console.log('2. Dominio no verificado (usa onboarding@resend.dev)');
      console.log('3. Problemas de red');
      return;
    }

    console.log('✅ ¡Email enviado correctamente!');
    console.log('📬 ID del email:', data?.id);
    console.log('\n✨ La configuración de Resend está funcionando.');
    console.log('Ahora sube tu código a Vercel y configura la variable de entorno allí.');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    console.log('\n📋 Verifica:');
    console.log('1. Que el paquete "resend" esté instalado: npm install resend');
    console.log('2. Que tu API key sea válida');
  }
}

testEmail();
