package futbol.academy.demo.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private boolean success;
    private String mensaje;
    private String nombre;
    private Long adminId;
}
