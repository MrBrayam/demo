package futbol.academy.demo.controller;

import futbol.academy.demo.model.Administrador;
import futbol.academy.demo.model.Matricula;
import futbol.academy.demo.repository.AdministradorRepository;
import futbol.academy.demo.repository.MatriculaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final MatriculaRepository matriculaRepository;
    private final AdministradorRepository administradorRepository;

    public AdminController(MatriculaRepository matriculaRepository,
                           AdministradorRepository administradorRepository) {
        this.matriculaRepository = matriculaRepository;
        this.administradorRepository = administradorRepository;
    }

    /**
     * Verifica que el header X-Admin-User / X-Admin-Pass correspondan a un admin válido.
     */
    private boolean credencialesValidas(String username, String password) {
        if (username == null || password == null) return false;
        Optional<Administrador> admin = administradorRepository
                .findByUsernameAndPassword(username, password);
        return admin.isPresent();
    }

    // RF-06: Gestionar y consultar matrículas desde el panel de administración
    @GetMapping("/matriculas")
    public ResponseEntity<?> listarTodasLasMatriculas(
            @RequestHeader(value = "X-Admin-User", required = false) String username,
            @RequestHeader(value = "X-Admin-Pass", required = false) String password) {

        if (!credencialesValidas(username, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Acceso denegado. Credenciales inválidas.");
        }
        return ResponseEntity.ok(matriculaRepository.findAll());
    }
}
