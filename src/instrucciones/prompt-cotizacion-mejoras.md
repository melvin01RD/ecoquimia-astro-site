# Mejoras página de Cotización - Ecoquimia

En la página de cotización (/cotizacion) hay 2 funcionalidades que necesito implementar:

---

## 1. Conectar tarjetas de servicio con el formulario

### Problema actual

Las tarjetas de "Tipos de servicio" (lado izquierdo) no están conectadas con el campo select "Tipo de servicio" del formulario (lado derecho). Al hacer clic en una tarjeta no pasa nada.

### Lo que necesito

- Cada tarjeta de servicio debe ser clickeable
- Al hacer clic en una tarjeta (ej: "Desinsectación"), el campo select del formulario debe seleccionar automáticamente esa opción
- La tarjeta seleccionada debe mostrar un estado visual activo (puede ser un borde de color, sombra más pronunciada, o fondo diferente)
- Si ya hay una tarjeta seleccionada y el usuario hace clic en otra, la anterior pierde el estado activo y la nueva lo gana

### Servicios disponibles

Asegurarse que coincidan entre tarjetas y opciones del select:

- Desinsectación
- Desratización
- Sanitización / Desinfección
- Tratamiento antitermitas
- Limpieza de tanques
- Control de palomas

### Implementación sugerida

- Agregar event listeners a cada tarjeta
- Al hacer clic, buscar el select por su id/name y cambiar su value
- Agregar/quitar una clase CSS para el estado activo de la tarjeta

---

## 2. Página de agradecimiento después de enviar el formulario

### Lo que necesito

- Después de que el usuario envíe el formulario exitosamente, redirigir a una página de agradecimiento (puede ser /gracias o /cotizacion/gracias)
- La página debe mostrar un mensaje de confirmación como: "¡Gracias por contactarnos!" y un texto secundario como "Hemos recibido tu solicitud. Te responderemos en horario laboral."
- Incluir un botón para volver al inicio
- Mantener el mismo diseño/estilo del resto del sitio (header, footer, colores de marca)

---

## Criterios de aceptación

- [ ] Click en tarjeta de servicio → actualiza el select del formulario
- [ ] Tarjeta seleccionada muestra estado visual activo
- [ ] Envío exitoso del formulario → redirige a página de gracias
- [ ] Página de gracias tiene mensaje de confirmación y botón de volver
- [ ] Todo funciona en desktop y mobile
