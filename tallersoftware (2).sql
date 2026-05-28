-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 28-05-2026 a las 16:03:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tallersoftware`
--
CREATE DATABASE IF NOT EXISTS `tallersoftware` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `tallersoftware`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
CREATE TABLE `alumnos` (
  `id` bigint(20) NOT NULL,
  `nombreCompleto` varchar(100) NOT NULL,
  `fechaNacimiento` date NOT NULL,
  `dni` varchar(20) NOT NULL,
  `correoTutor` varchar(150) NOT NULL,
  `contrasena` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `nombreCompleto`, `fechaNacimiento`, `dni`, `correoTutor`, `contrasena`, `activo`) VALUES
(1, 'Juan Carlos Perez Rios', '2016-03-15', '71234501', 'carlos.perez@gmail.com', '71234501', 1),
(2, 'Sofia Valentina Lopez Cruz', '2014-07-22', '71234502', 'ana.lopez@hotmail.com', '71234502', 1),
(3, 'Miguel Angel Torres Vega', '2011-11-08', '71234503', 'roberto.torres@yahoo.com', '71234503', 1),
(4, 'Lucia Fernanda Ruiz Mora', '2012-04-30', '71234504', 'lucia.tutor@gmail.com', '71234504', 1),
(5, 'Sebastian Gomez Paredes', '2009-09-12', '71234505', 'jose.gomez@outlook.com', '71234505', 1),
(6, 'Valentina Castro Herrera', '2010-02-18', '71234506', 'maria.castro@gmail.com', '71234506', 1),
(7, 'Andres Felipe Ramos Diaz', '2015-06-25', '71234507', 'felipe.ramos@gmail.com', '71234507', 1),
(8, 'Isabella Morales Espinoza', '2013-12-03', '71234508', 'diana.morales@hotmail.com', '71234508', 1),
(9, 'Brayam', '2006-02-08', '71490956', 'brayamaristafrndz@gmail.com', '71490956', 1),
(10, 'Marco', '2005-05-05', '96322514', 'holamundo@gmail.com', '96322514', 1),
(11, 'Andy', '2005-04-04', '41478596', 'holamundo2@gmail.com', '41478596', 1),
(12, 'Gabriel', '2026-05-20', '45822678', 'oengf@woiebgfw.com', '45822678', 1),
(13, 'Amyling', '2004-12-29', '66295614', 'amyling@gmail.com', '66295614', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `edadMinima` int(11) NOT NULL,
  `edadMaxima` int(11) NOT NULL,
  `cuposDisponibles` int(11) NOT NULL DEFAULT 0,
  `montoMatricula` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `edadMinima`, `edadMaxima`, `cuposDisponibles`, `montoMatricula`, `activo`) VALUES
(1, 'Infantil', 6, 10, 18, 100.00, 1),
(2, 'Junior', 11, 14, 15, 120.00, 1),
(3, 'Sub-17', 15, 17, 0, 150.00, 1),
(4, 'Sub-18', 18, 18, 8, 200.00, 1),
(5, 'Sub-29', 19, 19, 15, 250.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
CREATE TABLE `matriculas` (
  `id` bigint(20) NOT NULL,
  `alumno_id` bigint(20) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `fechaRegistro` datetime NOT NULL,
  `estado` varchar(20) NOT NULL,
  `referenciaPago` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `matriculas`
--

INSERT INTO `matriculas` (`id`, `alumno_id`, `categoria_id`, `fechaRegistro`, `estado`, `referenciaPago`) VALUES
(1, 1, 1, '2026-05-01 09:15:00', 'CONFIRMADA', 'REF-A1B2C3D4'),
(2, 2, 2, '2026-05-02 10:30:00', 'CONFIRMADA', 'REF-E5F6G7H8'),
(3, 3, 2, '2026-05-03 11:00:00', 'CONFIRMADA', 'REF-I9J0K1L2'),
(4, 4, 2, '2026-05-04 14:45:00', 'ANULADA', NULL),
(5, 5, 3, '2026-05-05 08:20:00', 'CONFIRMADA', 'REF-M3N4O5P6'),
(6, 6, 3, '2026-05-06 16:10:00', 'EN_ESPERA', NULL),
(7, 7, 1, '2026-05-07 09:50:00', 'CONFIRMADA', 'REF-Q7R8S9T0'),
(8, 8, 2, '2026-05-08 13:25:00', 'ANULADA', NULL),
(9, 4, 2, '2026-05-14 17:05:37', 'CONFIRMADA', 'REF-6CCE3645'),
(10, 9, 3, '2026-05-14 17:10:52', 'CONFIRMADA', 'REF-074002A3'),
(11, 10, 3, '2026-05-14 17:16:06', 'CONFIRMADA', 'REF-B8D6EA9A'),
(12, 11, 3, '2026-05-14 18:00:50', 'ANULADA', 'REF-BA3545CF'),
(13, 9, 2, '2026-05-21 17:33:18', 'CONFIRMADA', 'MANUAL-ADMIN'),
(14, 11, 3, '2026-05-21 17:36:12', 'CONFIRMADA', 'REF-D5257A8D'),
(15, 9, 3, '2026-05-21 17:39:08', 'CONFIRMADA', 'REF-4055E334'),
(16, 5, 4, '2026-05-26 18:22:52', 'CONFIRMADA', 'REF-37EB0CA0'),
(17, 5, 4, '2026-05-28 08:39:46', 'ANULADA', NULL),
(18, 13, 4, '2026-05-28 08:41:24', 'CONFIRMADA', 'REF-6E3F8E45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `password`, `nombre`, `activo`, `created_at`) VALUES
(1, 'admin', 'admin123', 'Administrador', 1, '2026-05-21 15:27:14');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alumno` (`alumno_id`),
  ADD KEY `fk_categoria` (`categoria_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD CONSTRAINT `fk_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `fk_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
