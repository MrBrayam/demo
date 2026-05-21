package futbol.academy.demo.controller;

import futbol.academy.demo.dto.MatriculaCategoriaDTO;
import futbol.academy.demo.dto.MatriculaEstadoDTO;
import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.dto.ReporteMensualDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Usuario;
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

    public AdminController(UsuarioService usuarioService, MatriculaService matriculaService) {
        this.usuarioService = usuarioService;
        this.matriculaService = matriculaService;
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
