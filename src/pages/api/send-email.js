export const prerender = false;
export const runtime = "node";

import { Resend } from 'resend';

export async function POST({ request }) {
  try {
    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY no configurada');
      return new Response(JSON.stringify({ error: 'Configuracion de email incompleta' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(apiKey);
    const data = await request.json();

    const { nombre, email, telefono, servicio, mensaje } = data;
    if (!nombre || !email || !telefono || !servicio || !mensaje) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ecoquimia <onboarding@resend.dev>';
    const toEmail = import.meta.env.CONTACT_TO || process.env.CONTACT_TO || 'melvin01rd@gmail.com';

    const { data: emailData, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Nueva Cotizacion: ${servicio} - Ecoquimia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1d7a53; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Nueva Solicitud de Cotizacion</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Ecoquimia - Control de Plagas</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #1d7a53;">
              <p style="margin: 0;"><strong>Nombre:</strong> ${nombre}</p>
            </div>

            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #1d7a53;">
              <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            </div>

            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #1d7a53;">
              <p style="margin: 0;"><strong>Telefono:</strong> <a href="tel:${telefono}">${telefono}</a></p>
            </div>

            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #1d7a53;">
              <p style="margin: 0;"><strong>Servicio Solicitado:</strong> ${servicio}</p>
            </div>

            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #1d7a53;">
              <p style="margin: 0 0 10px 0;"><strong>Mensaje:</strong></p>
              <p style="margin: 0; padding: 10px; background: #f9fafb; border-radius: 4px; white-space: pre-wrap;">${mensaje}</p>
            </div>
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center;">
            <p style="margin: 0;">Solicitud recibida el ${new Date().toLocaleString('es-DO', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: 'America/Santo_Domingo'
            })}</p>
            <p style="margin: 5px 0 0 0;">Enviado desde <strong>www.ecoquimia.com.do</strong></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error Resend:', error);
      return new Response(JSON.stringify({ error: 'Error al enviar el email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Email enviado correctamente:', emailData?.id);
    return new Response(JSON.stringify({ success: true, message: 'Cotizacion enviada correctamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error del servidor:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
