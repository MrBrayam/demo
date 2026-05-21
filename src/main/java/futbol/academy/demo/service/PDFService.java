package futbol.academy.demo.service;

import futbol.academy.demo.model.Matricula;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
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
        return generarPdfBasico(contenido);
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

    private byte[] generarPdfBasico(String texto) {
        List<String> lineas = List.of(texto.split("\\n"));
        StringBuilder contenido = new StringBuilder();
        contenido.append("BT\n");
        contenido.append("/F1 12 Tf\n");
        contenido.append("50 750 Td\n");

        for (int i = 0; i < lineas.size(); i++) {
            if (i > 0) {
                contenido.append("0 -16 Td\n");
            }
            contenido.append("(").append(escapePdf(lineas.get(i))).append(") Tj\n");
        }

        contenido.append("ET\n");

        byte[] contenidoBytes = contenido.toString().getBytes(StandardCharsets.US_ASCII);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        List<Integer> offsets = new ArrayList<>();

        write(out, "%PDF-1.4\n");

        offsets.add(out.size());
        write(out, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        offsets.add(out.size());
        write(out, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

        offsets.add(out.size());
        write(out, "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R ");
        write(out, "/Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");

        offsets.add(out.size());
        write(out, "4 0 obj\n<< /Length " + contenidoBytes.length + " >>\nstream\n");
        out.writeBytes(contenidoBytes);
        write(out, "\nendstream\nendobj\n");

        offsets.add(out.size());
        write(out, "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        int xrefStart = out.size();
        write(out, "xref\n0 " + (offsets.size() + 1) + "\n");
        write(out, "0000000000 65535 f \n");
        for (Integer offset : offsets) {
            write(out, String.format("%010d 00000 n \n", offset));
        }

        write(out, "trailer\n<< /Size " + (offsets.size() + 1) + " /Root 1 0 R >>\n");
        write(out, "startxref\n" + xrefStart + "\n%%EOF");

        return out.toByteArray();
    }

    private String escapePdf(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
            .replace("(", "\\(")
            .replace(")", "\\)");
    }

    private void write(ByteArrayOutputStream out, String value) {
        out.writeBytes(value.getBytes(StandardCharsets.US_ASCII));
    }
}
