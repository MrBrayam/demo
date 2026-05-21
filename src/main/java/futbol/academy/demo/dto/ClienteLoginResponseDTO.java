package futbol.academy.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteLoginResponseDTO {
    private boolean success;
    private String mensaje;
    private String nombre;
    private String dni;
}
