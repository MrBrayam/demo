package futbol.academy.demo.service;

import futbol.academy.demo.model.Usuario;
import futbol.academy.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Optional<Usuario> autenticar(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        return usuarioRepository.findByUsernameAndPasswordAndActivoTrue(username, password);
    }
}
