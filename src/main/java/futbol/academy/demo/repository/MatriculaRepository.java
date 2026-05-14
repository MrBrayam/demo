package futbol.academy.demo.repository;

import futbol.academy.demo.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
	List<Matricula> findAllByOrderByFechaRegistroDesc(Pageable pageable);
}
