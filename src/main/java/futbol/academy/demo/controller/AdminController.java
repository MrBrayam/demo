package futbol.academy.demo.controller;

import futbol.academy.demo.model.Matricula;
import futbol.academy.demo.repository.MatriculaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final MatriculaRepository matriculaRepository;

    public AdminController(MatriculaRepository matriculaRepository) {
        this.matriculaRepository = matriculaRepository;
    }

    // RF-06: Gestionar y consultar matrículas desde el panel de administración
    @GetMapping("/matriculas")
    public ResponseEntity<List<Matricula>> listarTodasLasMatriculas() {
        return ResponseEntity.ok(matriculaRepository.findAll());
    }
}
