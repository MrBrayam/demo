package futbol.academy.demo.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombreCompleto;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 digitos")
    private String dni;

    @Email(message = "Correo del tutor invalido")
    @NotBlank
    private String correoTutor;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;

    @NotBlank(message = "El metodo de pago es obligatorio")
    private String metodoPago;   

    private String tokenPago;   
}
