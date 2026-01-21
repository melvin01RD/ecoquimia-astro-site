// src/pages/api/send-email.js
import { Resend } from 'resend';

// IMPORTANTE: Esto hace que esta ruta sea server-side en Vercel
export const prerender = false;

export async function POST({ request }) {
  try {
    // 1. Leer los datos del formulario
    const data = await request.json();
    
    // 2. Validar que los campos requeridos estén presentes
    if (!data.nombre || !data.email || !data.telefono || !data.servicio) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Faltan campos requeridos' 
        }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Inicializar Resend con la API key
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // 4. Enviar el email
    const { data: emailData, error } = await resend.emails.send({
      from: 'Ecoquimia <onboarding@resend.dev>', // Usando dominio temporal de Resend
      to: ['melvin01rd@gmail.com'],
      replyTo: data.email, // Para que puedas responder directamente al cliente
      subject: `🦟 Nueva Cotización: ${data.servicio} - Ecoquimia`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
            strong { color: #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🦟 Nueva Solicitud de Cotización</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Ecoquimia - Control de Plagas</p>
            </div>
            
            <div class="content">
              <div class="info-box">
                <p><strong>👤 Nombre:</strong> ${data.nombre}</p>
              </div>
              
              <div class="info-box">
                <p><strong>📧 Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              </div>
              
              <div class="info-box">
                <p><strong>📱 Teléfono:</strong> <a href="tel:${data.telefono}">${data.telefono}</a></p>
              </div>
              
              <div class="info-box">
                <p><strong>🛠️ Servicio Solicitado:</strong> ${data.servicio}</p>
              </div>
              
              ${data.mensaje ? `
              <div class="info-box">
                <p><strong>💬 Mensaje:</strong></p>
                <p style="margin-top: 10px; padding: 10px; background: #f9fafb; border-radius: 4px;">${data.mensaje}</p>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Solicitud recibida el ${new Date().toLocaleString('es-DO', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'America/Santo_Domingo'
              })}</p>
              <p style="margin-top: 5px;">Enviado desde <strong>www.ecoquimia.com.do</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // 5. Manejar errores de Resend
    if (error) {
      console.error('❌ Error de Resend:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error al enviar el email: ${error.message}` 
        }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 6. Respuesta exitosa
    console.log('✅ Email enviado correctamente:', emailData);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cotización enviada correctamente',
        emailId: emailData?.id
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // 7. Manejar errores inesperados
    console.error('❌ Error del servidor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor. Por favor intenta de nuevo.' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
