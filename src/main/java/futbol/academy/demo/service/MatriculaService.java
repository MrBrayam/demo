package futbol.academy.demo.service;

import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Alumno;
import futbol.academy.demo.model.Categoria;
import futbol.academy.demo.model.Matricula;
import futbol.academy.demo.repository.AlumnoRepository;
import futbol.academy.demo.repository.CategoriaRepository;
import futbol.academy.demo.repository.MatriculaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class MatriculaService {

    private final AlumnoRepository alumnoRepository;
    private final MatriculaRepository matriculaRepository;
    private final CategoriaRepository categoriaRepository;
    private final PagoService pagoService;
    private final PDFService pdfService;

    public MatriculaService(AlumnoRepository alumnoRepository,
                            MatriculaRepository matriculaRepository,
                            CategoriaRepository categoriaRepository,
                            PagoService pagoService,
                            PDFService pdfService) {
        this.alumnoRepository = alumnoRepository;
        this.matriculaRepository = matriculaRepository;
        this.categoriaRepository = categoriaRepository;
        this.pagoService = pagoService;
        this.pdfService = pdfService;
    }

    public MatriculaResponseDTO registrarMatricula(MatriculaRequestDTO request) {

        // 1. Verificar cupos disponibles
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (categoria.getCuposDisponibles() <= 0) {
            throw new SinCuposException("No hay cupos disponibles. Se puede registrar en lista de espera.");
        }

        // 2. Registrar o recuperar alumno
        Alumno alumno = verificarOCrearAlumno(request);

        // 3. Crear matrícula en estado PENDIENTE
        Matricula matricula = new Matricula();
        matricula.setAlumno(alumno);
        matricula.setCategoria(categoria);
        matricula.setFechaRegistro(LocalDateTime.now());
        matricula.setEstado(Matricula.EstadoMatricula.PENDIENTE);
        matriculaRepository.save(matricula);

        // 4. Procesar pago
        ResultadoPago resultado = pagoService.procesar(request.getTokenPago(), categoria.getMontoMatricula());

        if (!resultado.isAprobado()) {
            matricula.setEstado(Matricula.EstadoMatricula.RECHAZADA);
            matriculaRepository.save(matricula);
            throw new PagoRechazadoException("El pago fue rechazado: " + resultado.getMensaje());
        }

        // 5. Confirmar matrícula y reducir cupos
        matricula.setEstado(Matricula.EstadoMatricula.CONFIRMADA);
        matricula.setReferenciaPago(resultado.getReferencia());
        categoria.setCuposDisponibles(categoria.getCuposDisponibles() - 1);
        matriculaRepository.save(matricula);
        categoriaRepository.save(categoria);

        // 6. Generar y enviar PDF
        byte[] pdf = pdfService.generarConstancia(matricula);
        pdfService.enviarPorCorreo(alumno.getCorreoTutor(), pdf, matricula);

        return new MatriculaResponseDTO(matricula.getId(), "CONFIRMADA", resultado.getReferencia());
    }

    public byte[] obtenerConstancia(Long matriculaId) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matrícula no encontrada con ID: " + matriculaId));
        return pdfService.generarConstancia(matricula);
    }

    public Alumno verificarOCrearAlumno(MatriculaRequestDTO request) {
        return alumnoRepository.findByDni(request.getDni())
            .orElseGet(() -> crearAlumno(request));
    }

    private Alumno crearAlumno(MatriculaRequestDTO request) {
        Alumno alumno = new Alumno();
        alumno.setNombreCompleto(request.getNombreCompleto());
        alumno.setFechaNacimiento(request.getFechaNacimiento());
        alumno.setDni(request.getDni());
        alumno.setCorreoTutor(request.getCorreoTutor());
        return alumnoRepository.save(alumno);
    }
}
