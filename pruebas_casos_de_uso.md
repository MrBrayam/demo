# Pruebas de Casos de Uso
> *Del caso de uso a la cancha · probando antes de patear*

---

## Slide 2

> "Escribimos el caso de uso. Construimos el sistema. Pero... ¿cómo sabemos que hace lo que prometió hacer?"

**Respuesta: lo probamos.**

---

## Slide 3 — ¿Qué son las pruebas de caso de uso?

Una técnica de testing donde cada flujo del caso de uso se convierte en uno o varios casos de prueba ejecutables.

**Traducción futbolera:** el caso de uso es la jugada que diseñó el DT. La prueba de caso de uso es entrenarla en el campo hasta verla salir bien.

---

## Slide 4 — ¿Para qué sirven?

1. **Verificar requisitos** — Confirmas que el sistema hace lo que el cliente pidió.
2. **Detectar errores temprano** — Encuentras bugs antes de que lleguen al usuario final.
3. **Probar flujos reales** — Pruebas escenarios completos, no funciones aisladas.
4. **Trazabilidad total** — Cada prueba se relaciona con un requisito y un caso de uso.
5. **Documentar el sistema** — Las pruebas son evidencia formal de funcionamiento.
6. **Dar confianza al cliente** — "Mira, esto pasó todas las pruebas."

---

## Slide 5 — Recordemos el caso de uso

**Sistema de matrícula — Academia de Fútbol "Los Cracks"**

**CU-02: Registrar Matrícula**
- **Actor principal:** Padre / Alumno
- **Actor secundario:** Sistema de Pago

| Flujo | Descripción |
|-------|-------------|
| **Flujo Normal** | Datos válidos → cupo OK → pago OK → constancia emitida ✓ |
| **Flujo Alternativo** | Categoría sin cupo → sistema sugiere otra categoría |
| **Flujo de Excepción** | Pago rechazado → matrícula cancelada → notifica al actor |

> → De aquí salen TODOS los casos de prueba.

---

## Slide 6 — Del caso de uso al caso de prueba

```
1 Caso de Uso        →   3 Flujos            →   N Casos de Prueba
CU-02 Registrar          ● Normal                CP-01
Matrícula                ● Alternativo           CP-02
                         ● Excepción             CP-03
                                                 ...
```

**Regla de oro:** como mínimo, un caso de prueba por cada flujo (normal + cada alternativo + cada excepción).

---

## Slide 7 — Formato estándar de un caso de prueba

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único (ej. CP-01) |
| **Caso de uso asociado** | CU al que pertenece (ej. CU-02) |
| **Nombre** | Frase descriptiva del escenario probado |
| **Precondición** | Estado del sistema antes de ejecutar |
| **Datos de entrada** | Valores concretos que se usarán |
| **Pasos** | Acciones del tester, numeradas |
| **Resultado esperado** | Lo que DEBE pasar si todo está bien |
| **Resultado obtenido** | Lo que realmente pasó al ejecutar |
| **Estado** | ✓ Pasó / ✗ Falló / ⊘ Bloqueado |

---

## Slide 8 — CP-01 · Matrícula con datos válidos (Flujo Normal)

| Campo | Valor |
|-------|-------|
| **Caso de uso** | CU-02 Registrar Matrícula |
| **Precondición** | El padre está en la pantalla de matrícula; categoría Sub-12 tiene cupo. |
| **Datos** | Alumno: Juanito Pérez · DNI: 71234567 · Categoría: Sub-12 · Pago: Yape S/120 |
| **Pasos** | 1. Ingresar datos del alumno y tutor · 2. Seleccionar categoría Sub-12 · 3. Elegir método de pago Yape · 4. Confirmar matrícula |
| **Esperado** | Sistema registra matrícula, descuenta 1 cupo de Sub-12 y emite constancia PDF. |
| **Estado** | ✓ PASÓ |

---

## Slide 9 — CP-02 · Categoría sin cupo disponible (Flujo Alternativo)

| Campo | Valor |
|-------|-------|
| **Caso de uso** | CU-02 Registrar Matrícula (flujo alternativo FA-01) |
| **Precondición** | La categoría Sub-10 ya alcanzó su cupo máximo (20 alumnos). |
| **Datos** | Alumno: Lucas Ramírez · DNI: 73456712 · Categoría: Sub-10 |
| **Pasos** | 1. Ingresar datos del alumno y tutor · 2. Seleccionar categoría Sub-10 · 3. Intentar continuar |
| **Esperado** | Sistema muestra mensaje "Sin cupo disponible" y sugiere categorías con cupo. |
| **Estado** | ✓ PASÓ |

---

## Slide 10 — CP-03 · Pago rechazado por el banco (Flujo de Excepción)

| Campo | Valor |
|-------|-------|
| **Caso de uso** | CU-02 Registrar Matrícula (flujo de excepción FE-01) |
| **Precondición** | Sistema de Pago disponible; tarjeta del tutor sin saldo suficiente. |
| **Datos** | Alumno: Mía Torres · Categoría: Sub-14 · Tarjeta Visa **** 4242 · Saldo: S/0 |
| **Pasos** | 1. Completar datos correctamente · 2. Elegir pago con tarjeta · 3. Confirmar matrícula |
| **Esperado** | Sistema NO registra matrícula, libera el cupo reservado y muestra mensaje claro al usuario. |
| **Resultado obtenido** | Sistema registró matrícula pero pago quedó pendiente. |
| **Estado** | ✗ FALLÓ — reportar como bug |

---

## Slide 11 — Matriz de trazabilidad

> Una mirada panorámica: ¿cubrí todos los flujos?

| Caso de Uso | Flujo | ID Prueba | Estado |
|-------------|-------|-----------|--------|
| CU-01 Consultar Disponibilidad | Normal | CP-04 | ✓ Pasó |
| CU-02 Registrar Matrícula | Normal | CP-01 | ✓ Pasó |
| CU-02 Registrar Matrícula | Alternativo | CP-02 | ✓ Pasó |
| CU-02 Registrar Matrícula | Excepción | CP-03 | ✗ Falló |
| CU-04 Procesar Pago | Normal | CP-05 | ✓ Pasó |
| CU-05 Emitir Constancia PDF | Normal | CP-06 | ⊘ Pendiente |

> Sin trazabilidad no sabes qué falta probar. Es como jugar sin saber el marcador.

---

## Slide 12 — ¿Cómo se crean? Paso a paso

1. **Identifica el caso de uso** — Toma uno completo. No mezcles.
2. **Lista todos sus flujos** — Normal, alternativos y excepciones.
3. **Define un CP por flujo** — Mínimo uno; varios si hay variaciones.
4. **Diseña los datos** — Valores reales, válidos e inválidos.
5. **Escribe los pasos** — Claros, ejecutables por cualquiera.
6. **Define el resultado esperado** — Específico y verificable.
7. **Ejecuta y registra** — Compara esperado vs. obtenido.
8. **Reporta y vuelve a probar** — Si falla, registra el bug. Si pasa, ¡sigue!

---

## Slide 13 — Buenas prácticas

- ✓ **Datos reales** — Usa nombres, DNI y montos que reflejen el negocio.
- ✓ **Un escenario por prueba** — No mezcles dos cosas en el mismo caso.
- ✓ **Lenguaje claro** — Cualquier compañero debe poder ejecutarla.
- ✓ **Cubre los bordes** — Cero, máximo, negativos, vacíos. Ahí viven los bugs.
- ✓ **Documenta los fallos** — Capturas + pasos exactos para reproducir.
- ✓ **Versiona tus pruebas** — Si cambia el CU, actualiza la prueba.

---

## Slide 14 — Errores comunes (no los hagas)

- ✗ **Probar solo el camino feliz** — Los bugs viven en los flujos alternos.
- ✗ **Resultados esperados vagos** — "Funciona bien" no se puede verificar.
- ✗ **Datos inventados al vuelo** — Hoy 71234567, mañana otro. Imposible reproducir.
- ✗ **No registrar evidencia** — Si no hay captura, el bug no existió.
- ✗ **Mezclar varios CU** — Una prueba = un escenario, no una novela.
- ✗ **No volver a probar** — Arreglar sin re-testear es fe ciega.

---

## Slide 15

> "El que no prueba, entrega esperanza. El que prueba, entrega calidad."
>
> — *Sabiduría de testers — estilo Cornejo*

---

## Slide 16 — TAREA: Sigamos probando la academia

> Cubramos los casos de uso que aún no probamos en clase.

En clase probamos **CU-02 (Registrar Matrícula)**. Faltan estos:

- CU-01 — Consultar Disponibilidad
- CU-04 — Procesar Pago
- CU-05 — Emitir Constancia PDF
- CU-06 — Gestionar Matrículas
- CU-07 — Anular / Modificar
- CU-08 — Generar Reporte Mensual

### Lo que deben hacer

1. Elegir **3 casos de uso** de la lista de arriba.
2. Identificar para cada uno: flujo normal + 1 alternativo + 1 excepción.
3. Diseñar **mínimo 9 casos de prueba** (3 por CU) usando el formato completo.
4. Armar la **matriz de trazabilidad** CU ↔ CP ↔ Estado.

> Equipos de 3. En la siguiente diapositiva tienes el formato a usar.

---

## Slide 17 — PLANTILLA: Formato completo del caso de prueba

| Campo | Qué debes llenar |
|-------|-----------------|
| **ID del caso de prueba** | CP-XX (numeración correlativa) |
| **Caso de uso asociado** | UC-XX Nombre del caso de uso |
| **Nombre del escenario** | Frase corta que describe el caso (ej. "Pago con tarjeta sin saldo") |
| **Tipo de flujo** | Normal / Alternativo (FA-XX) / Excepción (FE-XX) |
| **Precondición** | Estado del sistema antes de iniciar (datos, sesión, configuración) |
| **Datos de entrada** | Campo 1: valor · Campo 2: valor · Campo 3: valor |
| **Pasos a ejecutar** | 1. ... 2. ... 3. ... (numerados, claros y ejecutables) |
| **Resultado esperado** | Lo que debe ocurrir si el sistema funciona correctamente |
| **Resultado obtenido** | Lo que realmente ocurrió al ejecutar la prueba |
| **Estado** | ✓ Pasó / ✗ Falló / ⊘ Bloqueado |
| **Observaciones** | Notas adicionales, capturas, link a bug reportado |
| **Tester / Fecha** | Nombre del responsable y fecha de ejecución |

---

## Slide 18 — EJEMPLO LLENADO: Así debe quedar cada caso de prueba

| Campo | Valor |
|-------|-------|
| **ID** | CP-07 |
| **Caso de uso** | UC-01 Consultar Disponibilidad |
| **Nombre** | Consulta exitosa de cupos en categoría Sub-12 |
| **Tipo de flujo** | Normal |
| **Precondición** | El sistema está operativo. Existen 5 cupos libres en Sub-12. |
| **Datos de entrada** | Categoría: Sub-12 · Año: 2026 · Sede: Tarapoto |
| **Pasos** | 1. Ingresar al portal de la academia · 2. Clic en "Consultar disponibilidad" · 3. Seleccionar categoría Sub-12 y sede Tarapoto · 4. Pulsar "Buscar" |
| **Resultado esperado** | Sistema muestra: "Cupos disponibles: 5" en menos de 3 segundos. |
| **Resultado obtenido** | Sistema mostró: "Cupos disponibles: 5" en 1.8 segundos. |
| **Estado** | ✓ PASÓ |
| **Observaciones** | Tiempo de respuesta dentro del requisito no funcional RNF-02. |
| **Tester / Fecha** | Equipo Cracks-3 · 19/05/2026 |

---

## Slide 19 — ¿Qué deben presentar?

1. **Documento** — Con todos los casos de prueba formateados según la plantilla vista.
2. **Matriz de trazabilidad** — Tabla CU ↔ CP ↔ Estado, en el mismo documento.
3. **Evidencias** — Capturas o resultados de ejecutar cada prueba (al menos simulada).
4. **Reporte de fallos** — Si encontraron bugs, descripción + pasos para reproducir.
5. **Presentación oral** — 10 min, exponer 2 casos de prueba a elección.
6. **Reflexión final** — Una página: ¿qué aprendieron del proceso de prueba?

---

## Slide 20

> **Si no lo pruebas, no está terminado.**
>
> Ese código que no probaste es una bomba de tiempo en producción.

— *NOS VEMOS LA PRÓXIMA CLASE* —
