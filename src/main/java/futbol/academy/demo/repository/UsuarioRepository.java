package futbol.academy.demo.repository;

import futbol.academy.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameAndPasswordAndActivoTrue(String username, String password);
}
