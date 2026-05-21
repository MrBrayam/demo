package futbol.academy.demo.controller;

import futbol.academy.demo.dto.ClienteLoginRequestDTO;
import futbol.academy.demo.dto.ClienteLoginResponseDTO;
import futbol.academy.demo.dto.MatriculaPagoDTO;
import futbol.academy.demo.dto.MatriculaRecienteDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Alumno;
import futbol.academy.demo.service.ClienteService;
import futbol.academy.demo.service.MatriculaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cliente")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;
    private final MatriculaService matriculaService;

    public ClienteController(ClienteService clienteService, MatriculaService matriculaService) {
        this.clienteService = clienteService;
        this.matriculaService = matriculaService;
    }

    @PostMapping("/login")
    public ResponseEntity<ClienteLoginResponseDTO> login(@RequestBody ClienteLoginRequestDTO request) {
        Optional<Alumno> alumno = clienteService.autenticar(request.getDni(), request.getContrasena());
        if (alumno.isPresent()) {
            return ResponseEntity.ok(ClienteLoginResponseDTO.builder()
                .success(true)
                .mensaje("Login exitoso")
                .nombre(alumno.get().getNombreCompleto())
                .dni(alumno.get().getDni())
                .build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ClienteLoginResponseDTO.builder()
                .success(false)
                .mensaje("Credenciales invalidas")
                .build());
    }

    @GetMapping("/matriculas")
    public ResponseEntity<List<MatriculaRecienteDTO>> historial(
            @RequestHeader(value = "X-Cliente-Dni", required = false) String dni,
            @RequestHeader(value = "X-Cliente-Pass", required = false) String contrasena) {
        Optional<Alumno> alumno = clienteService.autenticar(dni, contrasena);
        if (alumno.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matriculaService.listarMatriculasPorAlumno(dni));
    }

    @PostMapping("/matriculas/{id}/pagar")
    public ResponseEntity<?> pagar(
            @RequestHeader(value = "X-Cliente-Dni", required = false) String dni,
            @RequestHeader(value = "X-Cliente-Pass", required = false) String contrasena,
            @PathVariable Long id,
            @RequestBody MatriculaPagoDTO request) {
        Optional<Alumno> alumno = clienteService.autenticar(dni, contrasena);
        if (alumno.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales invalidas");
        }

        MatriculaRecienteDTO actualizada = matriculaService.pagarMatricula(id, dni, request.tokenPago());
        return ResponseEntity.ok(actualizada);
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
