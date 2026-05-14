# Análisis, Diseño e Implementación — Módulo de Matrícula para Academia de Fútbol

**Tecnologías:** Java (backend), HTML5 + CSS + JavaScript (frontend)  
**Alcance:** Registro de alumnos, verificación de cupos, procesamiento de pago y generación de constancia PDF

---

## 1. Historia de Usuario — HU-01

**HU-01 · Sistema de Matrícula — Academia de Fútbol**

> Don Rolando Pérez llega un martes a la Academia "El Puntapié de Oro" con su hijo Juanito (8 años). Pregunta si hay cupos. La señorita responde: "No sé, espere que llamo al profe." Veinte minutos después, nadie sabe nada. Don Rolando juró no volver.

**Formato de historia:**

- **COMO** padre/tutor de un alumno menor de edad,
- **QUIERO** registrar la matrícula de mi hijo en la academia, verificar disponibilidad de cupos, seleccionar la categoría según su edad y realizar el pago de forma segura en línea,
- **PARA QUE** mi hijo pueda entrenar formalmente y yo reciba una constancia oficial sin tener que buscar al profe por WhatsApp a las 11pm.

**Elementos clave:**

| Campo | Valor |
|---|---|
| Actor Principal | Padre / Alumno |
| Actor Secundario | Administrador |
| Necesidad | Matrícula en línea |
| Categoría | Por rango de edad |
| Pago | Seguro y confirmado |
| Constancia | Comprobante oficial PDF |
| Prioridad | Alta — Sprint 1 |

---

## 2. Identificación de Requisitos

### 2.1 Requisitos Funcionales

| ID | Descripción |
|---|---|
| RF-01 | Registrar datos del alumno: nombre, edad, DNI, correo, tutor. |
| RF-02 | Consultar disponibilidad de cupos por categoría en tiempo real. |
| RF-03 | Seleccionar la categoría según rango de edad del alumno. |
| RF-04 | Procesar pago mediante pasarela segura (tarjeta / transferencia). |
| RF-05 | Generar y enviar constancia de matrícula en formato PDF. |
| RF-06 | Gestionar y consultar matrículas desde el panel de administración. |

### 2.2 Requisitos No Funcionales

| ID | Área | Descripción |
|---|---|---|
| RNF-01 | Seguridad | Cifrado TLS 1.3 y hashing de credenciales con bcrypt. |
| RNF-02 | Usabilidad | Interfaz responsive accesible desde móviles (WCAG 2.1 AA). |
| RNF-03 | Rendimiento | Tiempo de respuesta menor o igual a 2 segundos para el 95% de las peticiones. |
| RNF-04 | Disponibilidad | SLA del 99.5% en horario de atención (7am–10pm). |
| RNF-05 | Escalabilidad | Soporte para 500 matrículas concurrentes sin degradación. |
| RNF-06 | Portabilidad | Compatible con Chrome mayor o igual a 100, Firefox mayor o igual a 100, Edge y Safari. |

---

## 3. Diagrama de Casos de Uso

Los actores y casos de uso del sistema son los siguientes:

**Actores:**
- Padre / Alumno (actor principal externo)
- Administrador (actor interno)
- Sistema de Pago (actor secundario externo)

**Casos de uso:**

```
[Padre / Alumno]
    |-- UC-01: Consultar disponibilidad de cupos
    |-- UC-02: Registrar matrícula
    |       |-- include --> UC-01
    |       |-- include --> UC-04: Procesar pago
    |-- UC-03: Descargar constancia PDF

[Administrador]
    |-- UC-05: Gestionar matrículas
    |-- UC-06: Ver panel de categorías y cupos

[Sistema de Pago]
    |-- extend --> UC-04: Procesar pago
```

---

## 4. Especificación de Caso de Uso — CU-02: Registrar Matrícula

| Campo | Descripción |
|---|---|
| Identificador | CU-02 |
| Actor(es) | Padre / Alumno (principal) · Sistema de Pago (secundario) |
| Precondición | Se ha consultado disponibilidad (UC-01). Existen cupos en la categoría seleccionada. |
| Postcondición | La matrícula queda registrada y el alumno activo en el sistema. El tutor recibe la constancia PDF en su correo. |

**Flujo Normal:**

1. El actor ingresa datos del alumno y del tutor.
2. El sistema valida campos y verifica cupo disponible.
3. El actor selecciona categoría y método de pago.
4. El sistema procesa el pago a través de la pasarela externa.
5. El sistema registra la matrícula y genera la constancia PDF.

**Flujos Alternativos:**

- **FA-1 (Datos inválidos):** El sistema muestra mensaje de error y solicita corrección de campos.
- **FA-2 (Pago rechazado):** El sistema notifica el rechazo y permite reintentar o cambiar el método.

**Flujos de Excepción:**

- **FE-1 (Sin cupos):** El sistema informa la situación y ofrece registrar en lista de espera.
- **FE-2 (Fallo del sistema):** Se persiste el intento fallido y se notifica automáticamente al administrador.

---

## 5. Prototipo de Interfaz — Wireframe

**Flujo de pantallas:** Datos del Alumno → Categoría y Pago → Confirmación

### Paso 1: Datos del Alumno

```
+--------------------------------------------------+
|  Módulo de Matrícula — Academia de Fútbol        |
|--------------------------------------------------|
|  Paso 1 de 3 · Datos del Alumno                  |
|                                                  |
|  Nombre completo *                               |
|  [ ej. Juan Pérez Ríos                       ]   |
|                                                  |
|  Fecha de nacimiento *                           |
|  [ DD/MM/AAAA                                ]   |
|                                                  |
|  DNI / Documento *                               |
|  [ 12345678                                  ]   |
|                                                  |
|  Correo del tutor *                              |
|  [ correo@ejemplo.com                        ]   |
|                                                  |
|                          [ Siguiente → ]         |
+--------------------------------------------------+
```

### Paso 2: Categoría y Pago

```
+--------------------------------------------------+
|  Paso 2 de 3 · Categoría y Pago                  |
|                                                  |
|  Categoría *                                     |
|  [ Infantil / Junior / Sub-17             v ]    |
|                                                  |
|  Monto de matrícula                              |
|  S/ 150.00                                       |
|                                                  |
|  Método de pago *                                |
|  ( ) Tarjeta de crédito/débito                   |
|  ( ) Transferencia bancaria                      |
|                                                  |
|  Número de tarjeta *                             |
|  [ **** **** **** 1234                       ]   |
|                                                  |
|  [← Atrás]           [ Pagar S/ 150.00 ]         |
+--------------------------------------------------+
```

### Paso 3: Confirmación

```
+--------------------------------------------------+
|  Paso 3 de 3 · Confirmación                      |
|                                                  |
|          Matrícula registrada con éxito          |
|                                                  |
|  Se ha enviado la constancia al correo           |
|  del tutor registrado.                           |
|                                                  |
|  [ Descargar Constancia PDF ]                    |
|  [ Volver al inicio ]                            |
+--------------------------------------------------+
```

---

## 6. Arquitectura de Componentes

### 6.1 Diagrama de capas

```
+-------------------+       +---------------------+
|    FRONTEND       |       |     BACKEND (Java)   |
|   HTML5/CSS/JS    | <---> |   Spring Boot MVC    |
+-------------------+       +---------------------+
         |                           |
         |                  +--------+--------+
         |                  |                 |
         v                  v                 v
   [REST API HTTP]   [Servicio de        [Servicio
                      Matrícula]          de Pago]
                           |                 |
                  +--------+     +-----------+
                  |              |
                  v              v
            [Base de       [Pasarela de
             Datos]          Pago Ext.]
                  |
                  v
            [Generador PDF]
```

### 6.2 Componentes principales

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Vista de matrícula | HTML5 + CSS + JavaScript | Formulario de 3 pasos, validación en cliente |
| Controlador REST | Java — Spring MVC | Recibir peticiones, delegar a servicios |
| Servicio de matrícula | Java — Spring Service | Validar datos, verificar cupos, registrar |
| Repositorio | Java — Spring Data JPA | Persistencia en base de datos relacional |
| Servicio de pago | Java | Integración con pasarela externa |
| Generador de constancia | Java — iText o OpenPDF | Crear y enviar PDF al tutor |

---

## 7. Implementación

### 7.1 Estructura de proyecto Java (Spring Boot)

```
academia-matricula/
├── src/
│   └── main/
│       ├── java/com/academia/matricula/
│       │   ├── controller/
│       │   │   ├── MatriculaController.java
│       │   │   └── AdminController.java
│       │   ├── service/
│       │   │   ├── MatriculaService.java
│       │   │   ├── PagoService.java
│       │   │   └── PDFService.java
│       │   ├── repository/
│       │   │   ├── AlumnoRepository.java
│       │   │   ├── MatriculaRepository.java
│       │   │   └── CategoriaRepository.java
│       │   ├── model/
│       │   │   ├── Alumno.java
│       │   │   ├── Matricula.java
│       │   │   └── Categoria.java
│       │   └── dto/
│       │       ├── MatriculaRequestDTO.java
│       │       └── MatriculaResponseDTO.java
│       └── resources/
│           ├── application.properties
│           └── templates/   (si se usa Thymeleaf)
└── pom.xml
```

---

### 7.2 Modelo — Entidades Java

El proyecto usa **Lombok**, por eso no es necesario escribir getters, setters ni constructores. Las anotaciones `@Data`, `@Builder`, `@NoArgsConstructor` y `@AllArgsConstructor` los generan en tiempo de compilacion.

#### Alumno.java

```java
@Entity
@Table(name = "alumnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombreCompleto;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(nullable = false, length = 150)
    private String correoTutor;

    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL)
    @ToString.Exclude   // evita bucle infinito en toString con relacion bidireccional
    private List<Matricula> matriculas;
}
```

#### Categoria.java

```java
@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;        // Infantil, Junior, Sub-17

    @Column(nullable = false)
    private int edadMinima;

    @Column(nullable = false)
    private int edadMaxima;

    @Column(nullable = false)
    private int cuposDisponibles;

    @Column(nullable = false)
    private BigDecimal montoMatricula;
}
```

#### Matricula.java

```java
@Entity
@Table(name = "matriculas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMatricula estado;   // PENDIENTE, CONFIRMADA, RECHAZADA, EN_ESPERA

    @Column(length = 100)
    private String referenciaPago;

    public enum EstadoMatricula {
        PENDIENTE, CONFIRMADA, RECHAZADA, EN_ESPERA
    }
}
```

---

### 7.3 DTO de entrada y salida

#### MatriculaRequestDTO.java

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombreCompleto;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 digitos")
    private String dni;

    @Email(message = "Correo del tutor invalido")
    @NotBlank
    private String correoTutor;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;

    @NotBlank(message = "El metodo de pago es obligatorio")
    private String metodoPago;   // "TARJETA" | "TRANSFERENCIA"

    private String tokenPago;    // token generado por la pasarela en el cliente
}
```

---

### 7.4 Capa de servicio — MatriculaService.java

```java
@Service
@Transactional
public class MatriculaService {

    private final AlumnoRepository alumnoRepository;
    private final MatriculaRepository matriculaRepository;
    private final CategoriaRepository categoriaRepository;
    private final PagoService pagoService;
    private final PDFService pdfService;

    public MatriculaService(AlumnoRepository alumnoRepository,
                            MatriculaRepository matriculaRepository,
                            CategoriaRepository categoriaRepository,
                            PagoService pagoService,
                            PDFService pdfService) {
        this.alumnoRepository = alumnoRepository;
        this.matriculaRepository = matriculaRepository;
        this.categoriaRepository = categoriaRepository;
        this.pagoService = pagoService;
        this.pdfService = pdfService;
    }

    public MatriculaResponseDTO registrarMatricula(MatriculaRequestDTO request) {

        // 1. Verificar cupos disponibles
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (categoria.getCuposDisponibles() <= 0) {
            throw new SinCuposException("No hay cupos disponibles. Se puede registrar en lista de espera.");
        }

        // 2. Registrar o recuperar alumno
        Alumno alumno = alumnoRepository.findByDni(request.getDni())
            .orElseGet(() -> crearAlumno(request));

        // 3. Crear matrícula en estado PENDIENTE
        Matricula matricula = new Matricula();
        matricula.setAlumno(alumno);
        matricula.setCategoria(categoria);
        matricula.setFechaRegistro(LocalDateTime.now());
        matricula.setEstado(Matricula.EstadoMatricula.PENDIENTE);
        matriculaRepository.save(matricula);

        // 4. Procesar pago
        ResultadoPago resultado = pagoService.procesar(request.getTokenPago(), categoria.getMontoMatricula());

        if (!resultado.isAprobado()) {
            matricula.setEstado(Matricula.EstadoMatricula.RECHAZADA);
            matriculaRepository.save(matricula);
            throw new PagoRechazadoException("El pago fue rechazado: " + resultado.getMensaje());
        }

        // 5. Confirmar matrícula y reducir cupos
        matricula.setEstado(Matricula.EstadoMatricula.CONFIRMADA);
        matricula.setReferenciaPago(resultado.getReferencia());
        categoria.setCuposDisponibles(categoria.getCuposDisponibles() - 1);
        matriculaRepository.save(matricula);
        categoriaRepository.save(categoria);

        // 6. Generar y enviar PDF
        byte[] pdf = pdfService.generarConstancia(matricula);
        pdfService.enviarPorCorreo(alumno.getCorreoTutor(), pdf, matricula);

        return new MatriculaResponseDTO(matricula.getId(), "CONFIRMADA", resultado.getReferencia());
    }

    private Alumno crearAlumno(MatriculaRequestDTO request) {
        Alumno alumno = new Alumno();
        alumno.setNombreCompleto(request.getNombreCompleto());
        alumno.setFechaNacimiento(request.getFechaNacimiento());
        alumno.setDni(request.getDni());
        alumno.setCorreoTutor(request.getCorreoTutor());
        return alumnoRepository.save(alumno);
    }
}
```

---

### 7.5 Controlador REST — MatriculaController.java

```java
@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
public class MatriculaController {

    private final MatriculaService matriculaService;
    private final CategoriaRepository categoriaRepository;

    public MatriculaController(MatriculaService matriculaService,
                               CategoriaRepository categoriaRepository) {
        this.matriculaService = matriculaService;
        this.categoriaRepository = categoriaRepository;
    }

    // RF-02: Consultar disponibilidad de cupos
    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    // RF-01 / RF-03 / RF-04 / RF-05: Registrar matrícula completa
    @PostMapping
    public ResponseEntity<MatriculaResponseDTO> registrar(
            @Valid @RequestBody MatriculaRequestDTO request) {
        MatriculaResponseDTO response = matriculaService.registrarMatricula(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // RF-06: Descargar constancia PDF
    @GetMapping("/{id}/constancia")
    public ResponseEntity<byte[]> descargarConstancia(@PathVariable Long id) {
        byte[] pdf = matriculaService.obtenerConstancia(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=constancia_" + id + ".pdf")
            .body(pdf);
    }

    // Manejador de excepción sin cupos
    @ExceptionHandler(SinCuposException.class)
    public ResponseEntity<String> manejarSinCupos(SinCuposException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // Manejador de pago rechazado
    @ExceptionHandler(PagoRechazadoException.class)
    public ResponseEntity<String> manejarPagoRechazado(PagoRechazadoException ex) {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(ex.getMessage());
    }
}
```

---

### 7.6 Frontend — Estructura de archivos

```
frontend/
├── index.html          (página principal con el formulario de 3 pasos)
├── css/
│   └── styles.css      (estilos simples, paleta de colores plana)
└── js/
    ├── main.js         (controlador del flujo de pasos)
    ├── validacion.js   (validación en cliente)
    └── api.js          (llamadas al backend)
```

---

### 7.7 Frontend — index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrícula — Academia de Fútbol</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<main class="contenedor">

    <header class="encabezado">
        <h1>Academia de Fútbol</h1>
        <p class="subtitulo">Registro de Matrícula</p>
    </header>

    <!-- Indicador de pasos -->
    <nav class="pasos" aria-label="Progreso del formulario">
        <span class="paso activo" id="indicador-1">1. Datos</span>
        <span class="separador">—</span>
        <span class="paso" id="indicador-2">2. Categoría y Pago</span>
        <span class="separador">—</span>
        <span class="paso" id="indicador-3">3. Confirmación</span>
    </nav>

    <!-- PASO 1: Datos del alumno -->
    <section id="paso-1" class="seccion-formulario">
        <h2>Paso 1 — Datos del Alumno</h2>

        <div class="campo">
            <label for="nombre">Nombre completo *</label>
            <input type="text" id="nombre" name="nombre"
                   placeholder="ej. Juan Pérez Ríos" required>
            <span class="error" id="error-nombre"></span>
        </div>

        <div class="campo">
            <label for="fechaNacimiento">Fecha de nacimiento *</label>
            <input type="date" id="fechaNacimiento" name="fechaNacimiento" required>
            <span class="error" id="error-fecha"></span>
        </div>

        <div class="campo">
            <label for="dni">DNI / Documento *</label>
            <input type="text" id="dni" name="dni"
                   placeholder="12345678" maxlength="8" required>
            <span class="error" id="error-dni"></span>
        </div>

        <div class="campo">
            <label for="correoTutor">Correo del tutor *</label>
            <input type="email" id="correoTutor" name="correoTutor"
                   placeholder="correo@ejemplo.com" required>
            <span class="error" id="error-correo"></span>
        </div>

        <div class="acciones">
            <button type="button" id="btn-siguiente-1">Siguiente</button>
        </div>
    </section>

    <!-- PASO 2: Categoría y pago -->
    <section id="paso-2" class="seccion-formulario oculto">
        <h2>Paso 2 — Categoría y Pago</h2>

        <div class="campo">
            <label for="categoria">Categoría *</label>
            <select id="categoria" name="categoria" required>
                <option value="">Seleccione una categoría...</option>
            </select>
            <span class="error" id="error-categoria"></span>
        </div>

        <div class="campo">
            <label>Monto de matrícula</label>
            <p class="monto-display" id="montoDisplay">S/ —</p>
        </div>

        <div class="campo">
            <label>Método de pago *</label>
            <div class="opciones-pago">
                <label class="opcion-radio">
                    <input type="radio" name="metodoPago" value="TARJETA">
                    Tarjeta de crédito / débito
                </label>
                <label class="opcion-radio">
                    <input type="radio" name="metodoPago" value="TRANSFERENCIA">
                    Transferencia bancaria
                </label>
            </div>
            <span class="error" id="error-metodo"></span>
        </div>

        <div class="campo" id="campo-tarjeta">
            <label for="numeroTarjeta">Número de tarjeta *</label>
            <input type="text" id="numeroTarjeta" name="numeroTarjeta"
                   placeholder="**** **** **** 1234" maxlength="19">
            <span class="error" id="error-tarjeta"></span>
        </div>

        <div class="acciones">
            <button type="button" id="btn-atras-2">Atrás</button>
            <button type="button" id="btn-pagar">Pagar</button>
        </div>
    </section>

    <!-- PASO 3: Confirmación -->
    <section id="paso-3" class="seccion-formulario oculto">
        <h2>Paso 3 — Confirmación</h2>
        <div class="confirmacion">
            <p class="titulo-exito">Matrícula registrada con éxito</p>
            <p>La constancia ha sido enviada al correo del tutor registrado.</p>
            <p id="referenciaConfirmacion" class="referencia"></p>
            <div class="acciones">
                <button type="button" id="btn-descargar">Descargar Constancia PDF</button>
                <button type="button" id="btn-reiniciar">Volver al inicio</button>
            </div>
        </div>
    </section>

</main>

<script src="js/api.js"></script>
<script src="js/validacion.js"></script>
<script src="js/main.js"></script>
</body>
</html>
```

---

### 7.8 Frontend — styles.css

```css
/* --- Variables y reset --- */
:root {
    --color-primario: #1a3a5c;
    --color-secundario: #f0f4f8;
    --color-acento: #2b7a0b;
    --color-error: #b00020;
    --color-borde: #c0c8d0;
    --color-texto: #1e1e1e;
    --color-texto-suave: #555555;
    --fuente-base: Arial, sans-serif;
    --radio: 4px;
}

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--fuente-base);
    background-color: #f5f7fa;
    color: var(--color-texto);
    font-size: 16px;
    line-height: 1.5;
}

/* --- Contenedor principal --- */
.contenedor {
    max-width: 640px;
    margin: 40px auto;
    background-color: #ffffff;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio);
    padding: 32px;
}

/* --- Encabezado --- */
.encabezado {
    margin-bottom: 24px;
}

.encabezado h1 {
    font-size: 22px;
    color: var(--color-primario);
}

.subtitulo {
    font-size: 14px;
    color: var(--color-texto-suave);
    margin-top: 4px;
}

/* --- Indicador de pasos --- */
.pasos {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
    font-size: 13px;
    color: var(--color-texto-suave);
}

.paso {
    padding: 4px 10px;
    border-radius: var(--radio);
    background-color: var(--color-secundario);
}

.paso.activo {
    background-color: var(--color-primario);
    color: #ffffff;
    font-weight: bold;
}

.separador {
    color: var(--color-borde);
}

/* --- Secciones de formulario --- */
.seccion-formulario h2 {
    font-size: 17px;
    color: var(--color-primario);
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-borde);
}

.campo {
    margin-bottom: 18px;
}

.campo label {
    display: block;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 6px;
    color: var(--color-texto);
}

.campo input[type="text"],
.campo input[type="email"],
.campo input[type="date"],
.campo select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio);
    font-size: 15px;
    color: var(--color-texto);
    background-color: #ffffff;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
}

.campo input.invalido {
    border-color: var(--color-error);
}

.error {
    display: block;
    font-size: 12px;
    color: var(--color-error);
    margin-top: 4px;
    min-height: 16px;
}

/* --- Opciones de pago --- */
.opciones-pago {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.opcion-radio {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
}

/* --- Monto --- */
.monto-display {
    font-size: 20px;
    font-weight: bold;
    color: var(--color-primario);
    padding: 8px 0;
}

/* --- Acciones --- */
.acciones {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

button {
    padding: 10px 22px;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: var(--radio);
    cursor: pointer;
}

#btn-siguiente-1,
#btn-pagar {
    background-color: var(--color-primario);
    color: #ffffff;
}

#btn-atras-2,
#btn-reiniciar {
    background-color: var(--color-secundario);
    color: var(--color-primario);
    border: 1px solid var(--color-borde);
}

#btn-descargar {
    background-color: var(--color-acento);
    color: #ffffff;
}

button:hover {
    filter: brightness(0.92);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* --- Confirmación --- */
.confirmacion {
    text-align: center;
    padding: 24px 0;
}

.titulo-exito {
    font-size: 20px;
    font-weight: bold;
    color: var(--color-acento);
    margin-bottom: 12px;
}

.referencia {
    font-size: 13px;
    color: var(--color-texto-suave);
    margin-top: 8px;
}

/* --- Oculto --- */
.oculto {
    display: none;
}

/* --- Responsive --- */
@media (max-width: 680px) {
    .contenedor {
        margin: 0;
        border: none;
        padding: 24px 16px;
    }
}
```

---

### 7.9 Frontend — api.js

```javascript
// URL base del backend Spring Boot
const API_BASE = 'http://localhost:8080/api';

/**
 * Obtiene las categorías disponibles con sus cupos y montos.
 * Endpoint: GET /api/matriculas/categorias
 */
async function obtenerCategorias() {
    const response = await fetch(`${API_BASE}/matriculas/categorias`);
    if (!response.ok) {
        throw new Error('No se pudieron cargar las categorías.');
    }
    return response.json();
}

/**
 * Envía el formulario completo al backend para registrar la matrícula.
 * Endpoint: POST /api/matriculas
 */
async function registrarMatricula(datos) {
    const response = await fetch(`${API_BASE}/matriculas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (response.status === 409) {
        const mensaje = await response.text();
        throw new Error(mensaje);   // Sin cupos
    }

    if (response.status === 402) {
        const mensaje = await response.text();
        throw new Error(mensaje);   // Pago rechazado
    }

    if (!response.ok) {
        throw new Error('Error al procesar la matrícula. Intente nuevamente.');
    }

    return response.json();
}

/**
 * Descarga la constancia PDF de una matrícula confirmada.
 * Endpoint: GET /api/matriculas/{id}/constancia
 */
async function descargarConstancia(matriculaId) {
    const response = await fetch(`${API_BASE}/matriculas/${matriculaId}/constancia`);
    if (!response.ok) {
        throw new Error('No se pudo descargar la constancia.');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `constancia_${matriculaId}.pdf`;
    enlace.click();
    URL.revokeObjectURL(url);
}
```

---

### 7.10 Frontend — validacion.js

```javascript
/**
 * Valida los campos del Paso 1.
 * Retorna true si todos los campos son válidos.
 */
function validarPaso1() {
    let valido = true;

    const nombre = document.getElementById('nombre').value.trim();
    if (nombre.length < 3) {
        mostrarError('error-nombre', 'El nombre debe tener al menos 3 caracteres.');
        valido = false;
    } else {
        limpiarError('error-nombre');
    }

    const fecha = document.getElementById('fechaNacimiento').value;
    if (!fecha) {
        mostrarError('error-fecha', 'La fecha de nacimiento es obligatoria.');
        valido = false;
    } else {
        limpiarError('error-fecha');
    }

    const dni = document.getElementById('dni').value.trim();
    if (!/^\d{8}$/.test(dni)) {
        mostrarError('error-dni', 'El DNI debe contener exactamente 8 dígitos.');
        valido = false;
    } else {
        limpiarError('error-dni');
    }

    const correo = document.getElementById('correoTutor').value.trim();
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        mostrarError('error-correo', 'Ingrese un correo electrónico válido.');
        valido = false;
    } else {
        limpiarError('error-correo');
    }

    return valido;
}

/**
 * Valida los campos del Paso 2.
 */
function validarPaso2() {
    let valido = true;

    const categoriaId = document.getElementById('categoria').value;
    if (!categoriaId) {
        mostrarError('error-categoria', 'Seleccione una categoría.');
        valido = false;
    } else {
        limpiarError('error-categoria');
    }

    const metodo = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodo) {
        mostrarError('error-metodo', 'Seleccione un método de pago.');
        valido = false;
    } else {
        limpiarError('error-metodo');
        if (metodo.value === 'TARJETA') {
            const numero = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
            if (numero.length < 13) {
                mostrarError('error-tarjeta', 'Ingrese un número de tarjeta válido.');
                valido = false;
            } else {
                limpiarError('error-tarjeta');
            }
        }
    }

    return valido;
}

function mostrarError(idElemento, mensaje) {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = mensaje;
}

function limpiarError(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = '';
}
```

---

### 7.11 Frontend — main.js

```javascript
let categorias = [];
let matriculaIdConfirmada = null;

document.addEventListener('DOMContentLoaded', async () => {

    // Cargar categorías al iniciar
    try {
        categorias = await obtenerCategorias();
        const select = document.getElementById('categoria');
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.nombre} (${cat.cuposDisponibles} cupos) — S/ ${cat.montoMatricula}`;
            select.appendChild(option);
        });
    } catch (error) {
        alert('Error al cargar categorías: ' + error.message);
    }

    // Actualizar monto al elegir categoría
    document.getElementById('categoria').addEventListener('change', function () {
        const cat = categorias.find(c => c.id == this.value);
        document.getElementById('montoDisplay').textContent = cat ? `S/ ${cat.montoMatricula}` : 'S/ —';
    });

    // Mostrar campo tarjeta según método
    document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const campoTarjeta = document.getElementById('campo-tarjeta');
            campoTarjeta.style.display = this.value === 'TARJETA' ? 'block' : 'none';
        });
    });

    // Paso 1 -> Paso 2
    document.getElementById('btn-siguiente-1').addEventListener('click', () => {
        if (validarPaso1()) {
            mostrarPaso(2);
        }
    });

    // Paso 2 -> Paso 1
    document.getElementById('btn-atras-2').addEventListener('click', () => {
        mostrarPaso(1);
    });

    // Pagar
    document.getElementById('btn-pagar').addEventListener('click', async () => {
        if (!validarPaso2()) return;

        const boton = document.getElementById('btn-pagar');
        boton.disabled = true;
        boton.textContent = 'Procesando...';

        const datos = {
            nombreCompleto: document.getElementById('nombre').value.trim(),
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            dni: document.getElementById('dni').value.trim(),
            correoTutor: document.getElementById('correoTutor').value.trim(),
            categoriaId: parseInt(document.getElementById('categoria').value),
            metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
            tokenPago: 'tok_test_simulado'  // En producción: token real de pasarela
        };

        try {
            const respuesta = await registrarMatricula(datos);
            matriculaIdConfirmada = respuesta.matriculaId;
            document.getElementById('referenciaConfirmacion').textContent =
                'Referencia de pago: ' + respuesta.referenciaPago;
            mostrarPaso(3);
        } catch (error) {
            alert(error.message);
            boton.disabled = false;
            boton.textContent = 'Pagar';
        }
    });

    // Descargar constancia
    document.getElementById('btn-descargar').addEventListener('click', async () => {
        try {
            await descargarConstancia(matriculaIdConfirmada);
        } catch (error) {
            alert(error.message);
        }
    });

    // Reiniciar formulario
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
        location.reload();
    });
});

function mostrarPaso(numero) {
    [1, 2, 3].forEach(n => {
        document.getElementById(`paso-${n}`).classList.toggle('oculto', n !== numero);
        const indicador = document.getElementById(`indicador-${n}`);
        indicador.classList.toggle('activo', n === numero);
    });
}
```

---

## 8. Seguridad

### 8.1 Backend

- Validar todos los campos de entrada en el backend con Bean Validation (`@Valid`, `@NotBlank`, `@Email`). El `pom.xml` ya incluye `spring-boot-starter-validation`.
- Hashear contraseñas de administradores con BCrypt si se agrega autenticacion mas adelante:
  ```java
  PasswordEncoder encoder = new BCryptPasswordEncoder();
  String hash = encoder.encode(passwordPlano);
  ```
- En desarrollo local con XAMPP, la conexion corre en `localhost` sin SSL. En produccion (servidor real), activar HTTPS configurando el keystore en `application.properties`.
- No exponer la contrasena de la base de datos en el repositorio. En produccion usar variables de entorno:
  ```properties
  spring.datasource.password=${DB_PASSWORD}
  ```

### 8.2 Frontend

- No almacenar datos de tarjeta en el cliente. Usar el token generado por la pasarela de pago.
- Aplicar validacion en cliente (JavaScript) solo como experiencia de usuario. La validacion real y definitiva ocurre siempre en el servidor (`@Valid` en el DTO).

---

## 9. Pruebas

### 9.1 Casos de prueba

| ID | Escenario | Entrada | Resultado esperado |
|---|---|---|---|
| TP-01 | Registro exitoso | Datos válidos, cupos disponibles, pago aprobado | Matrícula CONFIRMADA, PDF enviado |
| TP-02 | Datos inválidos | DNI con letras | Error de validación en campo DNI |
| TP-03 | Sin cupos | Categoría llena | HTTP 409 con mensaje de lista de espera |
| TP-04 | Pago rechazado | Token de tarjeta rechazado | HTTP 402, matrícula queda RECHAZADA |
| TP-05 | Categoría no existe | ID de categoría inexistente | HTTP 404 |

### 9.2 Dependencias de prueba (Maven)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 10. Configuración del Proyecto

### 10.1 application.properties

Este es el archivo de configuración real del proyecto. Se conecta a MySQL a través de XAMPP en el puerto 3307.

```properties
spring.application.name=tallersoftware

# Conexion a MySQL via XAMPP (puerto 3307)
spring.datasource.url=jdbc:mysql://localhost:3307/apilp?useSSL=false
spring.datasource.username=apilp
spring.datasource.password=71490956@

# JPA / Hibernate
spring.jpa.generate-ddl=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
```

Notas importantes sobre esta configuracion:

- `generate-ddl=false` significa que Hibernate NO crea ni modifica las tablas automaticamente. Las tablas deben existir previamente en la base de datos `apilp` de XAMPP.
- `PhysicalNamingStrategyStandardImpl` respeta exactamente los nombres de campos y tablas tal como se declaran en las entidades Java, sin convertir camelCase a snake_case.
- `show-sql=true` imprime en consola cada sentencia SQL ejecutada, util para depuracion durante el desarrollo.
- Si XAMPP usa el puerto por defecto (3306), cambiar `3307` por `3306` en la URL.

### 10.2 Crear la base de datos en XAMPP

Abrir phpMyAdmin (`http://localhost/phpmyadmin`) y ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS apilp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'apilp'@'localhost' IDENTIFIED BY '71490956@';
GRANT ALL PRIVILEGES ON apilp.* TO 'apilp'@'localhost';
FLUSH PRIVILEGES;
```

Luego crear las tablas manualmente (ya que `generate-ddl=false`):

```sql
USE apilp;

CREATE TABLE categorias (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(50)    NOT NULL,
    edadMinima       INT            NOT NULL,
    edadMaxima       INT            NOT NULL,
    cuposDisponibles INT            NOT NULL DEFAULT 0,
    montoMatricula   DECIMAL(10,2)  NOT NULL
);

CREATE TABLE alumnos (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombreCompleto   VARCHAR(100)   NOT NULL,
    fechaNacimiento  DATE           NOT NULL,
    dni              VARCHAR(20)    NOT NULL UNIQUE,
    correoTutor      VARCHAR(150)   NOT NULL
);

CREATE TABLE matriculas (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    alumno_id        BIGINT         NOT NULL,
    categoria_id     BIGINT         NOT NULL,
    fechaRegistro    DATETIME       NOT NULL,
    estado           VARCHAR(20)    NOT NULL,
    referenciaPago   VARCHAR(100),
    CONSTRAINT fk_alumno    FOREIGN KEY (alumno_id)    REFERENCES alumnos(id),
    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Datos iniciales de categorias
INSERT INTO categorias (nombre, edadMinima, edadMaxima, cuposDisponibles, montoMatricula)
VALUES
    ('Infantil', 6,  10, 20, 100.00),
    ('Junior',   11, 14, 20, 120.00),
    ('Sub-17',   15, 17, 15, 150.00);
```

---

## Resumen de endpoints REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/matriculas/categorias | Listar categorías con cupos y montos |
| POST | /api/matriculas | Registrar matrícula completa |
| GET | /api/matriculas/{id}/constancia | Descargar constancia PDF |
| GET | /api/admin/matriculas | Listar todas las matrículas (admin) |
