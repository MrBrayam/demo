package futbol.academy.demo.service;

import futbol.academy.demo.model.Alumno;
import futbol.academy.demo.repository.AlumnoRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClienteService {

    private final AlumnoRepository alumnoRepository;

    public ClienteService(AlumnoRepository alumnoRepository) {
        this.alumnoRepository = alumnoRepository;
    }

    public Optional<Alumno> autenticar(String dni, String contrasena) {
        if (dni == null || contrasena == null) {
            return Optional.empty();
        }
        return alumnoRepository.findByDniAndContrasena(dni, contrasena);
    }
}
