package futbol.academy.demo.service;

import futbol.academy.demo.model.Matricula;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

/**
 * Servicio PDF simulado.
 * En producción se usaría iText o OpenPDF para generar el PDF real
 * y JavaMailSender para enviarlo por correo.
 */
@Service
public class PDFService {

    private static final Logger log = Logger.getLogger(PDFService.class.getName());

    /**
     * Genera la constancia de matrícula en formato PDF.
     * @param matricula La matrícula confirmada.
     * @return Bytes del PDF generado.
     */
    public byte[] generarConstancia(Matricula matricula) {
        // Simulación: en producción usar iText/OpenPDF
        String contenido = "CONSTANCIA DE MATRICULA\n"
                + "========================\n"
                + "ID Matricula: " + matricula.getId() + "\n"
                + "Alumno: " + matricula.getAlumno().getNombreCompleto() + "\n"
                + "Categoria: " + matricula.getCategoria().getNombre() + "\n"
                + "Estado: " + matricula.getEstado() + "\n"
                + "Referencia de Pago: " + matricula.getReferenciaPago() + "\n"
                + "Fecha de Registro: " + matricula.getFechaRegistro() + "\n";
        log.info("PDF generado para matricula ID=" + matricula.getId());
        return contenido.getBytes();
    }

    /**
     * Envía la constancia al correo del tutor.
     * @param correo Correo destino.
     * @param pdf Bytes del PDF.
     * @param matricula La matrícula confirmada.
     */
    public void enviarPorCorreo(String correo, byte[] pdf, Matricula matricula) {
        // Simulación: en producción usar JavaMailSender
        log.info("PDF enviado a " + correo + " para matricula ID=" + matricula.getId());
    }
}
