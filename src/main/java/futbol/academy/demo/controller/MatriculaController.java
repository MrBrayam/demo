package futbol.academy.demo.controller;

import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Categoria;
import futbol.academy.demo.repository.CategoriaRepository;
import futbol.academy.demo.service.MatriculaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
public class MatriculaController {

    private final MatriculaService matriculaService;
    private final CategoriaRepository categoriaRepository;

    public MatriculaController(MatriculaService matriculaService,
                               CategoriaRepository categoriaRepository) {
        this.matriculaService = matriculaService;
        this.categoriaRepository = categoriaRepository;
    }

    // RF-02: Consultar disponibilidad de cupos
    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    // RF-01 / RF-03 / RF-04 / RF-05: Registrar matrícula completa
    @PostMapping
    public ResponseEntity<MatriculaResponseDTO> registrar(
            @Validated @RequestBody MatriculaRequestDTO request) {
        MatriculaResponseDTO response = matriculaService.registrarMatricula(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Verificar o crear alumno en el Paso 1
    @PostMapping("/verificar-alumno")
    public ResponseEntity<Void> verificarAlumno(@RequestBody MatriculaRequestDTO request) {
        matriculaService.verificarOCrearAlumno(request);
        return ResponseEntity.ok().build();
    }

    // RF-06: Descargar constancia TXT
    @GetMapping("/{id}/constancia")
    public ResponseEntity<byte[]> descargarConstancia(@PathVariable Long id) {
        byte[] txt = matriculaService.obtenerConstancia(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "text/plain")
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=constancia_" + id + ".txt")
            .body(txt);
    }

    // Manejador de excepción sin cupos
    @ExceptionHandler(SinCuposException.class)
    public ResponseEntity<String> manejarSinCupos(SinCuposException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // Manejador de pago rechazado
    @ExceptionHandler(PagoRechazadoException.class)
    public ResponseEntity<String> manejarPagoRechazado(PagoRechazadoException ex) {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(ex.getMessage());
    }
}
