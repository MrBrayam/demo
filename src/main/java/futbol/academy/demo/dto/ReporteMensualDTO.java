package futbol.academy.demo.dto;

import java.math.BigDecimal;

public record ReporteMensualDTO(
    int anio,
    int mes,
    long totalMatriculas,
    long confirmadas,
    long rechazadas,
    long pendientes,
    long anuladas,
    BigDecimal montoConfirmado
) {
}
