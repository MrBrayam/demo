package futbol.academy.demo.controller;

import futbol.academy.demo.dto.LoginRequestDTO;
import futbol.academy.demo.dto.LoginResponseDTO;
import futbol.academy.demo.model.Usuario;
import futbol.academy.demo.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        Optional<Usuario> usuario = usuarioService.autenticar(request.getUsername(), request.getPassword());
        if (usuario.isPresent()) {
            return ResponseEntity.ok(LoginResponseDTO.builder()
                .success(true)
                .mensaje("Login exitoso")
                .nombre(usuario.get().getNombre())
                .build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(LoginResponseDTO.builder()
                .success(false)
                .mensaje("Usuario o clave incorrectos")
                .build());
    }
}
