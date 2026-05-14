package futbol.academy.demo.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaResponseDTO {

    private Long matriculaId;
    private String estado;
    private String referenciaPago;
}
