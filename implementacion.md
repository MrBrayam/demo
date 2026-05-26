## Plan: Mejorar interfaz y separar vistas Alumno/Administrador

TL;DR: Modernizar la UI usando una paleta de colores académica (tonos institucionales: azul marino, blanco, acentos dorados/verde), mejorar consistencia visual y UX, y separar claramente dos páginas/plantillas: Una para alumnos y otra para administradores. Cambios principales: rediseño CSS (variables y esquema), refactor JS (componentes compartidos), crear plantillas específicas y ajustes mínimos en backend para rutas/role hints.

**Steps**
1. Diseño visual (mockups rápidos) — *depends on 2*: definir paleta principal/secundaria, tipografía, estilos de botones y estados (éxito/alerta/neutral). Crear 2 mockups (alumno, admin).
2. Inventario y componentización — *parallel with 3*: identificar fragmentos HTML reutilizables (header, footer, tarjeta, tabla, badges) y extraerlos en plantillas o snippets.
3. CSS centralizado — *depends on 2*: crear/actualizar `src/main/resources/static/css/styles.css` con variables CSS (`--color-primary`, `--color-accent`, `--bg`, `--text`) y nuevas utilidades (cards, grids, sidebar, responsive). Mantener compatibilidad con clases actuales `.btn-accion`, `.estado-badge`.
4. Dos plantillas separadas — *depends on 2 & 3*: crear o adaptar:
   - [src/main/resources/static/cliente.html](src/main/resources/static/cliente.html) → interfaz para alumnos (dashboard personal, historial, pago, constancia).
   - [src/main/resources/static/admin.html](src/main/resources/static/admin.html) → interfaz para admin (gestión matrículas, reportes, panel de control).
   Mantener `index.html` y `cliente-login.html` como entry points pero redirigir a la plantilla según rol.
5. Refactor JS (UX + reutilizables) — *depends on 2 & 4*: extraer utilidades compartidas a `src/main/resources/static/js/utils.js` (formateadores, manejo de errores, renderizadores de rows/tables) y adaptar `cliente.js` y `admin.js` para usar componentes y mostrar UI acorde a la paleta y layout.
6. Ajustes backend mínimos — *parallel with 5 when necessary*: en controladores detectar rol y/o añadir pequeñas señales (p.ej. endpoint que devuelve `role: ADMIN|ALUMNO`) para decidir qué plantilla servir. Revisar [src/main/java/futbol/academy/demo/controller/AdminController.java](src/main/java/futbol/academy/demo/controller/AdminController.java) y [src/main/java/futbol/academy/demo/controller/ClienteController.java](src/main/java/futbol/academy/demo/controller/ClienteController.java).
7. Accesibilidad y responsive — *depends on 3 & 4*: asegurar contraste WCAG mínimo, tamaños táctiles, y que layout funcione en móvil (hamburger sidebar para admin).
8. Pruebas y verificación — ver sección “Verification”.

**Relevant files**
- [src/main/resources/static/cliente.html](src/main/resources/static/cliente.html)
- [src/main/resources/static/admin.html](src/main/resources/static/admin.html)
- [src/main/resources/static/index.html](src/main/resources/static/index.html)
- [src/main/resources/static/cliente-login.html](src/main/resources/static/cliente-login.html)
- [src/main/resources/static/css/styles.css](src/main/resources/static/css/styles.css)
- [src/main/resources/static/js/main.js](src/main/resources/static/js/main.js)
- [src/main/resources/static/js/api.js](src/main/resources/static/js/api.js)
- [src/main/resources/static/js/cliente.js](src/main/resources/static/js/cliente.js)
- [src/main/resources/static/js/admin.js](src/main/resources/static/js/admin.js)
- [src/main/java/futbol/academy/demo/controller/AdminController.java](src/main/java/futbol/academy/demo/controller/AdminController.java)
- [src/main/java/futbol/academy/demo/controller/ClienteController.java](src/main/java/futbol/academy/demo/controller/ClienteController.java)

**Verification**
1. Visual: comparar mockups con las páginas en local abriendo `index.html`/login y verificando redirección a cliente/admin.
2. Funcional: probar flujos clave - login alumno, ver historial, registrar matrícula, simulación de pago; login admin, ver lista de matrículas, cambiar estado, generar reporte mensual.
3. Tests automáticos (si existen): ejecutar suite de tests con `mvn test` y revisar que no se rompa la integración backend-frontend.
4. Revisión de accesibilidad: usar Lighthouse/axe para chequear contraste y navegación por teclado.

**Decisions / Suposiciones**
- Mantendremos el backend tal como está salvo pequeñas señales para servir templates por rol (no migramos a JWT por ahora).
- Usaremos CSS puro con variables (no añadir framework CSS como Bootstrap) para mantener control estético y tamaño del proyecto.
- Reutilizaremos la lógica de `api.js` y centralizaremos utilidades JS en `utils.js`.

**Further Considerations / Preguntas**
1. azul marino `#0B3D91`, blanco `#FFFFFF`, dorado/acento `#D4AF37`, gris neutro `#F5F5F5`).
2. mantener server-side para este proyecto pequeño.

