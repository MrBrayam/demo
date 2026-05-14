package futbol.academy.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MatriculaRecienteDTO(
    Long id,
    String alumno,
    String categoria,
    BigDecimal montoMatricula,
    LocalDateTime fechaRegistro,
    String estado,
    String referenciaPago
) {
}
