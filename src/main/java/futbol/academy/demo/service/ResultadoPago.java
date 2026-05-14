package futbol.academy.demo.service;

import lombok.Data;

/**
 * Resultado simulado de la pasarela de pago.
 * En producción, este objeto provendría de la respuesta real de la pasarela.
 */
@Data
public class ResultadoPago {
    private boolean aprobado;
    private String mensaje;
    private String referencia;
}
