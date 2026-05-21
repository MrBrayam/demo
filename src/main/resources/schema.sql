CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'alumnos'
      AND COLUMN_NAME = 'contrasena'
);

SET @sql_stmt = IF(
    @col_exists = 0,
    'ALTER TABLE alumnos ADD COLUMN contrasena VARCHAR(100) NULL',
    'SELECT 1'
);

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE alumnos SET contrasena = dni WHERE contrasena IS NULL;

-- Check and add 'activo' column in 'alumnos'
SET @col_alumno_activo = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'alumnos'
      AND COLUMN_NAME = 'activo'
);
SET @sql_stmt_alumno_activo = IF(
    @col_alumno_activo = 0,
    'ALTER TABLE alumnos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT 1'
);
PREPARE stmt FROM @sql_stmt_alumno_activo;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add 'activo' column in 'categorias'
SET @col_categoria_activo = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'categorias'
      AND COLUMN_NAME = 'activo'
);
SET @sql_stmt_categoria_activo = IF(
    @col_categoria_activo = 0,
    'ALTER TABLE categorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT 1'
);
PREPARE stmt FROM @sql_stmt_categoria_activo;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

