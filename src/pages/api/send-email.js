export const prerender = false;

import { Resend } from 'resend';

export async function POST({ request }) {
  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    const data = await request.json();

    // Validar datos requeridos
    const { nombre, email, telefono, servicio, mensaje } = data;
    if (!nombre || !email || !telefono || !servicio || !mensaje) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Ecoquimia <onboarding@resend.dev>',
      to: ['melvin01rd@gmail.com'],
      reply_to: email,
      subject: `Solicitud de Cotización - ${servicio}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">🪳 Nueva Solicitud de Cotización - Ecoquimia</h2>
          <p style="color: #7f8c8d;"><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-DO')}</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">📋 Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">🔧 Servicio Solicitado</h3>
            <p><strong>Servicio:</strong> ${servicio}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">💬 Mensaje del Cliente</h3>
            <p style="white-space: pre-wrap;">${mensaje}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Este email fue enviado desde el formulario de cotización de ecoquimia.com.do<br>
            Responda directamente a este email para contactar al cliente.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: 'Error al enviar el email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Cotización enviada exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}