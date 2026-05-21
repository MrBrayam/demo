package futbol.academy.demo.controller;

import futbol.academy.demo.dto.MatriculaCategoriaDTO;
import futbol.academy.demo.dto.MatriculaEstadoDTO;
import futbol.academy.demo.dto.MatriculaRecienteDTO;
import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.dto.ReporteMensualDTO;
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

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<MatriculaResponseDTO> registrar(
            @Validated @RequestBody MatriculaRequestDTO request) {
        MatriculaResponseDTO response = matriculaService.registrarMatricula(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MatriculaRecienteDTO>> listarMatriculas(
            @RequestParam(value = "estado", required = false) String estado) {
        return ResponseEntity.ok(matriculaService.listarMatriculas(estado));
    }

    @GetMapping("/recientes")
    public ResponseEntity<List<MatriculaRecienteDTO>> listarRecientes(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return ResponseEntity.ok(matriculaService.obtenerRecientes(safeLimit));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<MatriculaRecienteDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestBody MatriculaEstadoDTO request) {
        return ResponseEntity.ok(matriculaService.actualizarEstado(id, request.estado()));
    }

    @PutMapping("/{id}/categoria")
    public ResponseEntity<MatriculaRecienteDTO> cambiarCategoria(
            @PathVariable Long id,
            @RequestBody MatriculaCategoriaDTO request) {
        return ResponseEntity.ok(matriculaService.cambiarCategoria(id, request.categoriaId()));
    }

    @GetMapping("/reporte-mensual")
    public ResponseEntity<ReporteMensualDTO> reporteMensual(
            @RequestParam(value = "anio") int anio,
            @RequestParam(value = "mes") int mes) {
        return ResponseEntity.ok(matriculaService.generarReporteMensual(anio, mes));
    }


    @PostMapping("/verificar-alumno")
    public ResponseEntity<Void> verificarAlumno(@RequestBody MatriculaRequestDTO request) {
        matriculaService.verificarOCrearAlumno(request);
        return ResponseEntity.ok().build();
    }

    // RF-06: Descargar constancia PDF
    @GetMapping("/{id}/constancia")
    public ResponseEntity<byte[]> descargarConstancia(@PathVariable Long id) {
        byte[] pdf = matriculaService.obtenerConstancia(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=constancia_" + id + ".pdf")
            .body(pdf);
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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> manejarArgumentoInvalido(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
