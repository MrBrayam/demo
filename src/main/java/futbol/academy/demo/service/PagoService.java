package futbol.academy.demo.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Servicio de pago simulado.
 * En producción se integraría con una pasarela real (Stripe, Culqi, PayU, etc.).
 * El token 'tok_reject_test' simula un rechazo para pruebas.
 */
@Service
public class PagoService {

    public ResultadoPago procesar(String tokenPago, BigDecimal monto) {
        ResultadoPago resultado = new ResultadoPago();

        // Simulación: el token "tok_reject_test" simula rechazo
        if ("tok_reject_test".equals(tokenPago)) {
            resultado.setAprobado(false);
            resultado.setMensaje("Tarjeta rechazada por el banco emisor.");
            return resultado;
        }

        // Cualquier otro token se considera aprobado en modo simulación
        resultado.setAprobado(true);
        resultado.setMensaje("Pago procesado correctamente.");
        resultado.setReferencia("REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return resultado;
    }
}
