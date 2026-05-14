package futbol.academy.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "alumnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombreCompleto;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(nullable = false, length = 150)
    private String correoTutor;

    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL)
    @ToString.Exclude 
    private List<Matricula> matriculas;
}
