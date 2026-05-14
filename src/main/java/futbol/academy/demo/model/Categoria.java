package futbol.academy.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;        // Infantil, Junior, Sub-17

    @Column(nullable = false)
    private int edadMinima;

    @Column(nullable = false)
    private int edadMaxima;

    @Column(nullable = false)
    private int cuposDisponibles;

    @Column(nullable = false)
    private BigDecimal montoMatricula;
}
