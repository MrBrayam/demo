package futbol.academy.demo.controller;

import futbol.academy.demo.dto.MatriculaCategoriaDTO;
import futbol.academy.demo.dto.MatriculaEstadoDTO;
import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.dto.ReporteMensualDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Usuario;
import futbol.academy.demo.model.Alumno;
import futbol.academy.demo.model.Categoria;
import futbol.academy.demo.repository.AlumnoRepository;
import futbol.academy.demo.repository.CategoriaRepository;
import futbol.academy.demo.repository.UsuarioRepository;
import futbol.academy.demo.service.MatriculaService;
import futbol.academy.demo.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UsuarioService usuarioService;
    private final MatriculaService matriculaService;
    private final AlumnoRepository alumnoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public AdminController(UsuarioService usuarioService,
                           MatriculaService matriculaService,
                           AlumnoRepository alumnoRepository,
                           CategoriaRepository categoriaRepository,
                           UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.matriculaService = matriculaService;
        this.alumnoRepository = alumnoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Optional<Usuario> validarAdmin(String username, String password) {
        return usuarioService.autenticar(username, password);
    }

    private boolean credencialesInvalidas(String username, String password) {
        return validarAdmin(username, password).isEmpty();
    }

    @GetMapping("/matriculas")
    public ResponseEntity<?> listarMatriculas(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @RequestParam(value = "estado", required = false) String estado) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(matriculaService.listarMatriculas(estado));
    }

    @GetMapping("/matriculas/{id}")
    public ResponseEntity<?> obtenerMatricula(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(matriculaService.obtenerMatricula(id));
    }

    @PostMapping("/matriculas")
    public ResponseEntity<?> crearMatricula(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @Validated @RequestBody MatriculaRequestDTO request) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        MatriculaResponseDTO response = matriculaService.registrarMatricula(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/matriculas/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id,
            @RequestBody MatriculaEstadoDTO request) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(matriculaService.actualizarEstado(id, request.estado()));
    }

    @PutMapping("/matriculas/{id}/categoria")
    public ResponseEntity<?> cambiarCategoria(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id,
            @RequestBody MatriculaCategoriaDTO request) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(matriculaService.cambiarCategoria(id, request.categoriaId()));
    }

    @DeleteMapping("/matriculas/{id}")
    public ResponseEntity<?> eliminarMatricula(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        matriculaService.eliminarMatricula(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reporte-mensual")
    public ResponseEntity<?> reporteMensual(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @RequestParam(value = "anio") int anio,
            @RequestParam(value = "mes") int mes) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        ReporteMensualDTO reporte = matriculaService.generarReporteMensual(anio, mes);
        return ResponseEntity.ok(reporte);
    }

    // --- CRUD ALUMNOS ---
    @GetMapping("/alumnos")
    public ResponseEntity<?> listarAlumnos(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(alumnoRepository.findAll());
    }

    @PostMapping("/alumnos")
    public ResponseEntity<?> crearAlumno(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @RequestBody Alumno alumno) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        if (alumno.getDni() != null && alumnoRepository.findByDni(alumno.getDni()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un alumno con el mismo DNI.");
        }
        alumno.setActivo(true);
        if (alumno.getContrasena() == null || alumno.getContrasena().isBlank()) {
            alumno.setContrasena(alumno.getDni());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(alumnoRepository.save(alumno));
    }

    @PutMapping("/alumnos/{id}")
    public ResponseEntity<?> actualizarAlumno(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id,
            @RequestBody Alumno alumnoValores) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return alumnoRepository.findById(id).map(alumno -> {
            alumno.setNombreCompleto(alumnoValores.getNombreCompleto());
            alumno.setFechaNacimiento(alumnoValores.getFechaNacimiento());
            alumno.setDni(alumnoValores.getDni());
            alumno.setCorreoTutor(alumnoValores.getCorreoTutor());
            if (alumnoValores.getContrasena() != null && !alumnoValores.getContrasena().isBlank()) {
                alumno.setContrasena(alumnoValores.getContrasena());
            }
            if (alumnoValores.getActivo() != null) {
                alumno.setActivo(alumnoValores.getActivo());
            }
            return ResponseEntity.ok(alumnoRepository.save(alumno));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/alumnos/{id}")
    public ResponseEntity<?> eliminarAlumno(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return alumnoRepository.findById(id).map(alumno -> {
            alumno.setActivo(false); // Eliminacion logica
            alumnoRepository.save(alumno);
            return ResponseEntity.ok("Alumno desactivado exitosamente (eliminacion logica)");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- CRUD CATEGORIAS ---
    @GetMapping("/categorias")
    public ResponseEntity<?> listarCategorias(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping("/categorias")
    public ResponseEntity<?> crearCategoria(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @RequestBody Categoria categoria) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        categoria.setActivo(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaRepository.save(categoria));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<?> actualizarCategoria(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id,
            @RequestBody Categoria categoriaValores) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNombre(categoriaValores.getNombre());
            categoria.setEdadMinima(categoriaValores.getEdadMinima());
            categoria.setEdadMaxima(categoriaValores.getEdadMaxima());
            categoria.setCuposDisponibles(categoriaValores.getCuposDisponibles());
            categoria.setMontoMatricula(categoriaValores.getMontoMatricula());
            if (categoriaValores.getActivo() != null) {
                categoria.setActivo(categoriaValores.getActivo());
            }
            return ResponseEntity.ok(categoriaRepository.save(categoria));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<?> eliminarCategoria(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setActivo(false); // Eliminacion logica
            categoriaRepository.save(categoria);
            return ResponseEntity.ok("Categoria desactivada exitosamente (eliminacion logica)");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- CRUD ADMINISTRADORES (USUARIOS) ---
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @RequestBody Usuario usuario) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        if (usuario.getUsername() != null && usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un administrador con el mismo nombre de usuario.");
        }
        usuario.setActivo(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepository.save(usuario));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id,
            @RequestBody Usuario usuarioValores) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombre(usuarioValores.getNombre());
            usuario.setUsername(usuarioValores.getUsername());
            if (usuarioValores.getPassword() != null && !usuarioValores.getPassword().isBlank()) {
                usuario.setPassword(usuarioValores.getPassword());
            }
            if (usuarioValores.getActivo() != null) {
                usuario.setActivo(usuarioValores.getActivo());
            }
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password,
            @PathVariable Long id) {
        if (credencialesInvalidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setActivo(false); // Eliminacion logica
            usuarioRepository.save(usuario);
            return ResponseEntity.ok("Administrador desactivado exitosamente (eliminacion logica)");
        }).orElse(ResponseEntity.notFound().build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> manejarArgumentoInvalido(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(SinCuposException.class)
    public ResponseEntity<String> manejarSinCupos(SinCuposException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(PagoRechazadoException.class)
    public ResponseEntity<String> manejarPagoRechazado(PagoRechazadoException ex) {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(ex.getMessage());
    }
}
