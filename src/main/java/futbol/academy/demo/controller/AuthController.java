package futbol.academy.demo.controller;

import futbol.academy.demo.dto.LoginRequestDTO;
import futbol.academy.demo.dto.LoginResponseDTO;
import futbol.academy.demo.model.Administrador;
import futbol.academy.demo.repository.AdministradorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AdministradorRepository administradorRepository;

    public AuthController(AdministradorRepository administradorRepository) {
        this.administradorRepository = administradorRepository;
    }

    /**
     * POST /api/auth/login
     * Verifica credenciales del administrador (texto plano, modo taller).
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        Optional<Administrador> admin = administradorRepository
                .findByUsernameAndPassword(request.getUsername(), request.getPassword());

        if (admin.isPresent()) {
            return ResponseEntity.ok(LoginResponseDTO.builder()
                    .success(true)
                    .mensaje("Login exitoso. Bienvenido, " + admin.get().getNombre() + ".")
                    .nombre(admin.get().getNombre())
                    .adminId(admin.get().getId())
                    .build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponseDTO.builder()
                        .success(false)
                        .mensaje("Usuario o contraseña incorrectos.")
                        .build());
    }
}
