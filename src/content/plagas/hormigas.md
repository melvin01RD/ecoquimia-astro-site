$dir='src/content/plagas'; New-Item -ItemType Directory -Path $dir -Force | Out-Null; @'
---
title: "Eliminación de Hormigas"
excerpt: "Control en interiores y perímetros: cebos, exclusión y monitoreo."
cover: "/plagas/hormigas.jpg"
updated: "2025-09-27"
tags: ["perímetro", "cocina", "exteriores"]
# Usa uno u otro:
# videoUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
# videoMp4: "/videos/hormigas.mp4"
---

## Descripción
Las hormigas forman colonias con una o varias reinas y redes de forrajeo entre nidos y fuentes de alimento. Algunas especies comunes: **hormiga fantasma**, **hormiga argentina**, **hormiga loca**, **hormiga carpintera** (daño en madera) y **cortadoras** (hojas).

## Señales / Diagnóstico
- Trazas de forrajeo en zócalos, encimeras y jardines.
- Montículos en suelos o grietas en exteriores.
- Presencia de **alados** (enjambrazón) en épocas cálidas.
- Reaparición tras “spray” doméstico (dispersión de colonias).

## Riesgos
- Contaminación de superficies y alimentos.
- Daños en **madera** (carpinteras).
- Dispersión de colonias por uso incorrecto de insecticidas de choque.

## Tratamiento recomendado (IPM)
1. **Inspección y mapeo** de trazas, puntos de ingreso y posibles nidos.
2. **Saneamiento**: sellar contenedores de alimentos, limpiar derrames y retirar restos orgánicos.
3. **Exclusión**:
   - Sellado de grietas y pases de tubería.
   - Cepillos/burletes en puertas y tapas en drenajes.
4. **Cebos** (prioritario):
   - **Gel o cebo líquido** en rutas y cerca de puntos de ingreso.
   - **Granular** en perímetro/jardín para transporte al nido.
   - Evitar contaminar cebos con sprays o limpiadores.
5. **IGR (regulador de crecimiento)** para cortar ciclo y afectar la reina/cría.
6. **Perímetro exterior**:
   - Banda residual dirigida a bases, zócalos, fisuras y cimientos (según etiqueta).
   - Tratar montículos visibles con protocolo específico.
7. **Especies particulares**:
   - **Carpinteras**: localizar cavidades en madera; inyección puntual y corrección de humedad.
   - **Cortadoras**: manejo de senderos y nidos con cebo específico; evitar contacto directo con cultivos sensibles.
8. **Seguimiento** en 7–14 días; reubicación de cebos y ajustes según actividad.

## Preparación del área
- Retirar alimentos expuestos y limpiar superficies grasosas.
- Mantener mascotas y niños fuera durante el servicio y ventilación indicada.
- Señalizar zonas cebadas para no remover el producto.

## Productos utilizados
- **Cebos** (carbohidratos/proteicos, líquido/gel/granular) según especie y temporada.
- **IGR** compatible con cebo.
- **Residuales** de bajo olor para perímetros (uso profesional, según etiqueta).

## Zonas críticas
Cocinas, despensas, comedores, cuartos de máquinas, áreas húmedas, bases de muros, jardines, arriates y puntos de ingreso (puertas/ventanas).

## Preguntas frecuentes
**¿Por qué no usar solo spray?** Puede fragmentar la colonia y empeorar el problema.  
**¿Cuándo veré resultados?** Reducción en 24–72 h; control estable con refuerzos en 2–3 semanas.  
**¿Los cebos son seguros?** Se aplican de forma dirigida; seguir ficha técnica y mantener fuera del alcance de niños/mascotas.
'@ | Set-Content -Path "$dir/hormigas.md" -Encoding UTF8
