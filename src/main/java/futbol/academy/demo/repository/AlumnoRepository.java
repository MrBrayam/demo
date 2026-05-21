package futbol.academy.demo.repository;

import futbol.academy.demo.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    Optional<Alumno> findByDni(String dni);
    Optional<Alumno> findByDniAndContrasena(String dni, String contrasena);
}
