Plan de Implementación - Sidebar de Administrador y CRUDs en Portal Admin
Este plan detalla los cambios para incorporar un menú lateral (sidebar) en el portal de administrador que permita navegar entre las siguientes vistas:

Gestión de Matrículas (Vista existente, integrada).
Clientes (Alumnos) (Nuevo CRUD completo).
Categorías (Nuevo CRUD completo).
Administradores (Nuevo CRUD completo).
Reportes (Vista de reporte existente, integrada).
Para ello, implementaremos nuevos endpoints REST en el backend de Spring Boot y reestructuraremos el HTML/CSS/JS de la interfaz de administración.

User Review Required
IMPORTANT

Autenticación en los nuevos endpoints: Todos los nuevos endpoints CRUD en /api/admin/... verificarán el acceso a través de las cabeceras X-Admin-User y X-Admin-Pass (utilizando el método autenticar existente de UsuarioService).
Restricción de Eliminación: Si un Alumno o Categoría tiene matrículas asociadas en la base de datos, la base de datos lanzará un error de clave foránea. Controlaremos esta excepción en el backend y mostraremos un mensaje claro en la UI indicando que no se puede eliminar porque cuenta con matrículas registradas.
Clase .oculto: Utilizaremos la clase .oculto con la regla corregida (display: none !important;) para alternar fluidamente entre las vistas del administrador sin recargar la página.
Proposed Changes
Backend - Java API
[MODIFY] 
UsuarioRepository.java
Agregar el método Optional<Usuario> findByUsername(String username); para permitir la verificación de usuarios existentes por nombre de usuario al momento de crear administradores.
[MODIFY] 
Alumno.java
Agregar la anotación @JsonIgnore (de com.fasterxml.jackson.annotation.JsonIgnore) sobre el campo private List<Matricula> matriculas; para evitar excepciones de recursividad cíclica al serializar los alumnos a JSON.
[MODIFY] 
AdminController.java
Inyectar AlumnoRepository, CategoriaRepository y UsuarioRepository en el controlador.
Implementar los siguientes endpoints CRUD:
Alumnos (Clientes):
GET /api/admin/alumnos: Obtener todos los alumnos.
POST /api/admin/alumnos: Crear un nuevo alumno (validar DNI único).
PUT /api/admin/alumnos/{id}: Actualizar un alumno existente.
DELETE /api/admin/alumnos/{id}: Eliminar un alumno (capturar error si tiene matrículas).
Categorías:
GET /api/admin/categorias: Obtener todas las categorías.
POST /api/admin/categorias: Crear una nueva categoría.
PUT /api/admin/categorias/{id}: Actualizar una categoría existente.
DELETE /api/admin/categorias/{id}: Eliminar una categoría.
Administradores (Usuarios):
GET /api/admin/usuarios: Obtener todos los usuarios del sistema.
POST /api/admin/usuarios: Crear un nuevo administrador (validar username único).
PUT /api/admin/usuarios/{id}: Actualizar un administrador existente (actualizar contraseña solo si se provee una nueva).
DELETE /api/admin/usuarios/{id}: Eliminar un administrador.
Frontend - HTML, CSS & JS
[MODIFY] 
styles.css
Definir estilos de diseño específicos para el portal del administrador reutilizando o replicando la estructura de grillas:
.admin-layout (grilla de 2 columnas: 220px y 1fr).
.admin-sidebar (estilos para el panel lateral de navegación).
.admin-nav (botones del menú con estados :hover y .activo).
.admin-view (paneles principales que se alternan con .oculto).
Estilos específicos para formularios de edición/creación en línea (.admin-form-card).
[MODIFY] 
admin.html
Reestructurar el contenedor #admin-content para implementar la grilla de dos columnas.
Agregar la barra lateral <aside class="admin-sidebar"> con:
Nombre del administrador activo (#admin-user-display).
Botones de navegación con data-view: matriculas, alumnos, categorias, usuarios, reportes.
Botón de cerrar sesión.
Separar las secciones del contenido principal en paneles con la clase admin-view y sus respectivos IDs:
#view-matriculas: Tabla y filtros de matrículas.
#view-alumnos: Tabla de alumnos, botón "Nuevo Alumno", y un formulario en línea (#form-alumno-card) para crear/editar alumnos.
#view-categorias: Tabla de categorías, botón "Nueva Categoría", y un formulario en línea (#form-categoria-card) para crear/editar categorías.
#view-usuarios: Tabla de administradores, botón "Nuevo Administrador", y un formulario en línea (#form-usuario-card) para crear/editar usuarios.
#view-reportes: Formulario y resultados del reporte mensual.
[MODIFY] 
api.js
Agregar las funciones de interacción AJAX con los nuevos endpoints del backend utilizando las cabeceras de autenticación del administrador:
obtenerAlumnosAdmin(credenciales)
guardarAlumnoAdmin(credenciales, datos, id)
eliminarAlumnoAdmin(credenciales, id)
obtenerCategoriasAdmin(credenciales)
guardarCategoriaAdmin(credenciales, datos, id)
eliminarCategoriaAdmin(credenciales, id)
obtenerUsuariosAdmin(credenciales)
guardarUsuarioAdmin(credenciales, datos, id)
eliminarUsuarioAdmin(credenciales, id)
[MODIFY] 
admin.js
Agregar la lógica para manejar la navegación reactiva entre vistas usando los botones de la barra lateral.
Mostrar la información del usuario logueado en #admin-user-display.
Implementar la funcionalidad de listado, creación, edición y eliminación de cada entidad (Alumnos, Categorías, Usuarios):
Mantener estados locales para las listas cargadas.
Manejar el llenado del formulario al presionar "Editar".
Manejar el limpiado y alternancia de formularios con botones "Cancelar" y "Guardar".
Mostrar mensajes de éxito o error descriptivos para cada acción.
Verification Plan
Automated Tests
Compilar y ejecutar la aplicación Spring Boot para asegurar que compila correctamente tras las adiciones.
Manual Verification
Abrir admin.html en el navegador.
Iniciar sesión con un usuario administrador (ej. admin / admin123 o las credenciales por defecto).
Confirmar que se visualiza la barra lateral con las 5 opciones: Matrículas, Clientes (Alumnos), Categorías, Administradores y Reportes.
Probar la navegación haciendo clic en cada botón de la barra lateral; verificar que los contenidos cambien y la barra se mantenga visible y bien posicionada.
Probar CRUD de Clientes (Alumnos):
Listar alumnos cargados.
Crear un alumno nuevo y verificar que aparezca en la lista.
Editar el alumno creado y guardar los cambios.
Intentar eliminar un alumno (verificar la respuesta en caso de que tenga matrículas o si se elimina exitosamente).
Probar CRUD de Categorías:
Listar categorías.
Crear una categoría y verificar que el monto y cupos se listen bien.
Editar una categoría y confirmar los cambios.
Eliminar una categoría de prueba.
Probar CRUD de Administradores:
Listar los administradores registrados.
Crear un nuevo administrador.
Editar el administrador creado y cambiar su estado a inactivo, luego activo.
Eliminar el administrador de prueba.
Probar Matrículas y Reportes:
Confirmar que los filtros y las acciones de Matrículas (anular, cambiar categoría) sigan operando correctamente.
Confirmar que la generación de reportes mensuales siga funcionando bien.