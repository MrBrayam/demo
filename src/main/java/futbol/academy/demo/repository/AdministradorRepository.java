package futbol.academy.demo.repository;

import futbol.academy.demo.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    Optional<Administrador> findByUsernameAndPassword(String username, String password);
}
