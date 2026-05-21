package futbol.academy.demo.service;

import futbol.academy.demo.dto.MatriculaRecienteDTO;
import futbol.academy.demo.dto.MatriculaRequestDTO;
import futbol.academy.demo.dto.MatriculaResponseDTO;
import futbol.academy.demo.dto.ReporteMensualDTO;
import futbol.academy.demo.exception.PagoRechazadoException;
import futbol.academy.demo.exception.SinCuposException;
import futbol.academy.demo.model.Alumno;
import futbol.academy.demo.model.Categoria;
import futbol.academy.demo.model.Matricula;
import futbol.academy.demo.repository.AlumnoRepository;
import futbol.academy.demo.repository.CategoriaRepository;
import futbol.academy.demo.repository.MatriculaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    public List<MatriculaRecienteDTO> obtenerRecientes(int limit) {
        int safeLimit = Math.max(1, limit);
        return matriculaRepository
            .findAllByOrderByFechaRegistroDesc(PageRequest.of(0, safeLimit))
            .stream()
            .map(this::mapToReciente)
            .toList();
    }

    public List<MatriculaRecienteDTO> listarMatriculas(String estado) {
        if (estado == null || estado.isBlank()) {
            return matriculaRepository.findAll().stream()
                .map(this::mapToReciente)
                .toList();
        }

        Matricula.EstadoMatricula estadoEnum = parseEstado(estado);
        return matriculaRepository.findByEstado(estadoEnum).stream()
            .map(this::mapToReciente)
            .toList();
    }

    public List<MatriculaRecienteDTO> listarMatriculasPorAlumno(String dni) {
        return matriculaRepository.findByAlumnoDniOrderByFechaRegistroDesc(dni).stream()
            .map(this::mapToReciente)
            .toList();
    }

    public MatriculaRecienteDTO obtenerMatricula(Long matriculaId) {
        return mapToReciente(matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada")));
    }

    public void eliminarMatricula(Long matriculaId) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada"));
        if (matricula.getEstado() == Matricula.EstadoMatricula.CONFIRMADA) {
            Categoria categoria = matricula.getCategoria();
            categoria.setCuposDisponibles(categoria.getCuposDisponibles() + 1);
            categoriaRepository.save(categoria);
        }
        matriculaRepository.delete(matricula);
    }

    public MatriculaRecienteDTO pagarMatricula(Long matriculaId, String dni, String tokenPago) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada"));

        if (matricula.getAlumno() == null || !matricula.getAlumno().getDni().equals(dni)) {
            throw new IllegalArgumentException("Matricula no pertenece al alumno");
        }

        if (matricula.getEstado() == Matricula.EstadoMatricula.ANULADA) {
            throw new IllegalArgumentException("La matricula esta anulada");
        }

        if (matricula.getEstado() == Matricula.EstadoMatricula.CONFIRMADA) {
            return mapToReciente(matricula);
        }

        Categoria categoria = matricula.getCategoria();
        if (categoria.getCuposDisponibles() <= 0) {
            throw new SinCuposException("No hay cupos disponibles para esta categoria");
        }

        ResultadoPago resultado = pagoService.procesar(tokenPago, categoria.getMontoMatricula());
        if (!resultado.isAprobado()) {
            matricula.setEstado(Matricula.EstadoMatricula.RECHAZADA);
            matriculaRepository.save(matricula);
            throw new PagoRechazadoException(resultado.getMensaje());
        }

        categoria.setCuposDisponibles(categoria.getCuposDisponibles() - 1);
        categoriaRepository.save(categoria);

        matricula.setEstado(Matricula.EstadoMatricula.CONFIRMADA);
        matricula.setReferenciaPago(resultado.getReferencia());
        matriculaRepository.save(matricula);

        return mapToReciente(matricula);
    }

    public MatriculaRecienteDTO actualizarEstado(Long matriculaId, String estado) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada"));
        Matricula.EstadoMatricula nuevoEstado = parseEstado(estado);
        Matricula.EstadoMatricula estadoActual = matricula.getEstado();

        if (nuevoEstado == estadoActual) {
            return mapToReciente(matricula);
        }

        Categoria categoria = matricula.getCategoria();
        if (estadoActual == Matricula.EstadoMatricula.CONFIRMADA
                && nuevoEstado != Matricula.EstadoMatricula.CONFIRMADA) {
            categoria.setCuposDisponibles(categoria.getCuposDisponibles() + 1);
            categoriaRepository.save(categoria);
        }

        if (estadoActual != Matricula.EstadoMatricula.CONFIRMADA
                && nuevoEstado == Matricula.EstadoMatricula.CONFIRMADA) {
            if (categoria.getCuposDisponibles() <= 0) {
                throw new SinCuposException("No hay cupos disponibles para confirmar la matricula");
            }
            categoria.setCuposDisponibles(categoria.getCuposDisponibles() - 1);
            categoriaRepository.save(categoria);
        }

        matricula.setEstado(nuevoEstado);
        matriculaRepository.save(matricula);
        return mapToReciente(matricula);
    }

    public MatriculaRecienteDTO cambiarCategoria(Long matriculaId, Long categoriaId) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada"));
        Categoria categoriaNueva = categoriaRepository.findById(categoriaId)
            .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));

        Categoria categoriaActual = matricula.getCategoria();
        if (categoriaActual.getId().equals(categoriaNueva.getId())) {
            return mapToReciente(matricula);
        }

        if (matricula.getEstado() == Matricula.EstadoMatricula.CONFIRMADA) {
            if (categoriaNueva.getCuposDisponibles() <= 0) {
                throw new SinCuposException("No hay cupos disponibles en la nueva categoria");
            }
            categoriaActual.setCuposDisponibles(categoriaActual.getCuposDisponibles() + 1);
            categoriaNueva.setCuposDisponibles(categoriaNueva.getCuposDisponibles() - 1);
            categoriaRepository.save(categoriaActual);
            categoriaRepository.save(categoriaNueva);
        }

        matricula.setCategoria(categoriaNueva);
        matriculaRepository.save(matricula);
        return mapToReciente(matricula);
    }

    public ReporteMensualDTO generarReporteMensual(int anio, int mes) {
        if (mes < 1 || mes > 12) {
            throw new IllegalArgumentException("Mes invalido");
        }

        LocalDate inicio = LocalDate.of(anio, mes, 1);
        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = inicio.plusMonths(1).atStartOfDay().minusNanos(1);

        List<Matricula> matriculas = matriculaRepository.findByFechaRegistroBetween(fechaInicio, fechaFin);
        long total = matriculas.size();
        long confirmadas = matriculas.stream().filter(m -> m.getEstado() == Matricula.EstadoMatricula.CONFIRMADA).count();
        long rechazadas = matriculas.stream().filter(m -> m.getEstado() == Matricula.EstadoMatricula.RECHAZADA).count();
        long pendientes = matriculas.stream().filter(m -> m.getEstado() == Matricula.EstadoMatricula.PENDIENTE).count();
        long anuladas = matriculas.stream().filter(m -> m.getEstado() == Matricula.EstadoMatricula.ANULADA).count();

        BigDecimal montoConfirmado = matriculas.stream()
            .filter(m -> m.getEstado() == Matricula.EstadoMatricula.CONFIRMADA)
            .map(m -> m.getCategoria() != null ? m.getCategoria().getMontoMatricula() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ReporteMensualDTO(anio, mes, total, confirmadas, rechazadas, pendientes, anuladas, montoConfirmado);
    }

    public Alumno verificarOCrearAlumno(MatriculaRequestDTO request) {
        return alumnoRepository.findByDni(request.getDni())
            .map(alumno -> {
                if ((alumno.getContrasena() == null || alumno.getContrasena().isBlank())
                        && request.getContrasena() != null
                        && !request.getContrasena().isBlank()) {
                    alumno.setContrasena(request.getContrasena());
                    return alumnoRepository.save(alumno);
                }
                return alumno;
            })
            .orElseGet(() -> crearAlumno(request));
    }

    private Alumno crearAlumno(MatriculaRequestDTO request) {
        Alumno alumno = new Alumno();
        alumno.setNombreCompleto(request.getNombreCompleto());
        alumno.setFechaNacimiento(request.getFechaNacimiento());
        alumno.setDni(request.getDni());
        alumno.setCorreoTutor(request.getCorreoTutor());
        alumno.setContrasena(request.getContrasena());
        return alumnoRepository.save(alumno);
    }

    private MatriculaRecienteDTO mapToReciente(Matricula matricula) {
        return new MatriculaRecienteDTO(
            matricula.getId(),
            matricula.getAlumno() != null ? matricula.getAlumno().getNombreCompleto() : "N/A",
            matricula.getCategoria() != null ? matricula.getCategoria().getNombre() : "N/A",
            matricula.getCategoria() != null ? matricula.getCategoria().getId() : null,
            matricula.getCategoria() != null ? matricula.getCategoria().getMontoMatricula() : null,
            matricula.getFechaRegistro(),
            matricula.getEstado() != null ? matricula.getEstado().name() : "N/A",
            matricula.getReferenciaPago()
        );
    }

    private Matricula.EstadoMatricula parseEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException("Estado invalido");
        }
        return Matricula.EstadoMatricula.valueOf(estado.trim().toUpperCase());
    }
}
