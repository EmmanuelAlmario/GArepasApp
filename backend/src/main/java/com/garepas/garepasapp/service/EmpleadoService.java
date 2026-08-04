package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.EmpleadoRequest;
import com.garepas.garepasapp.dto.request.NominaRequest;
import com.garepas.garepasapp.dto.response.EmpleadoResponse;
import com.garepas.garepasapp.dto.response.NominaResponse;
import com.garepas.garepasapp.entity.Empleado;
import com.garepas.garepasapp.entity.Gasto;
import com.garepas.garepasapp.entity.Nomina;
import com.garepas.garepasapp.enums.CategoriaGasto;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.EmpleadoRepository;
import com.garepas.garepasapp.repository.GastoRepository;
import com.garepas.garepasapp.repository.NominaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final NominaRepository nominaRepository;
    private final GastoRepository gastoRepository;

    @Transactional(readOnly = true)
    public List<EmpleadoResponse> listarTodos() {
        List<Empleado> empleados = empleadoRepository.findAll();
        Map<Long, Integer> diasPagadosPorEmpleado = cargarDiasPagados(empleados);
        return empleados.stream()
                .map(e -> EmpleadoResponse.desde(e, diasPagadosPorEmpleado.getOrDefault(e.getId(), 0)))
                .toList();
    }

    @Transactional(readOnly = true)
    public EmpleadoResponse buscarPorId(Long id) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
        return toResponse(empleado);
    }

    @Transactional
    public EmpleadoResponse crear(EmpleadoRequest request) {
        if (empleadoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Empleado", "nombre", request.nombre());
        }
        Empleado empleado = Empleado.builder()
                .nombre(request.nombre())
                .precioDia(request.precioDia())
                .diasTrabajados(0)
                .activo(request.activo())
                .build();
        return toResponse(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoResponse actualizar(Long id, EmpleadoRequest request) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
        if (!empleado.getNombre().equalsIgnoreCase(request.nombre()) &&
                empleadoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Empleado", "nombre", request.nombre());
        }
        empleado.setNombre(request.nombre());
        empleado.setPrecioDia(request.precioDia());
        empleado.setActivo(request.activo());
        return toResponse(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoResponse agregarDias(Long id, Integer dias) {
        if (dias == null || dias <= 0) throw new OperacionInvalidaException("Los días a agregar deben ser positivos");
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
        empleado.setDiasTrabajados(empleado.getDiasTrabajados() + dias);
        return toResponse(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoResponse quitarDias(Long id, Integer dias) {
        if (dias == null || dias <= 0) throw new OperacionInvalidaException("Los días a quitar deben ser positivos");
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
        int nuevo = empleado.getDiasTrabajados() - dias;
        if (nuevo < 0) {
            throw new OperacionInvalidaException("No puedes quitar más días de los que tiene trabajados");
        }
        empleado.setDiasTrabajados(nuevo);
        return toResponse(empleadoRepository.save(empleado));
    }

    @Transactional
    public NominaResponse registrarPago(NominaRequest request) {
        Empleado empleado = empleadoRepository.findById(request.empleadoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", request.empleadoId()));

        Integer diasDebidos = empleado.getDiasTrabajados() -
                nominaRepository.sumDiasPagadosByEmpleadoId(empleado.getId());

        if (request.diasPagados() > diasDebidos) {
            throw new OperacionInvalidaException(
                    "No puedes pagar más días de los que se deben. Días debidos: " + diasDebidos);
        }

        Nomina nomina = Nomina.builder()
                .empleado(empleado)
                .diasPagados(request.diasPagados())
                .fecha(LocalDateTime.now())
                .build();

        NominaResponse response = NominaResponse.desde(nominaRepository.save(nomina));

        BigDecimal montoTotal = empleado.getPrecioDia()
                .multiply(BigDecimal.valueOf(request.diasPagados()));

        Gasto gasto = Gasto.builder()
                .descripcion("Pago nómina — " + empleado.getNombre() + " (" + request.diasPagados() + " día(s))")
                .monto(montoTotal)
                .categoria(CategoriaGasto.NOMINA_PERSONAL)
                .fecha(LocalDateTime.now())
                .build();

        gastoRepository.save(gasto);

        return response;
    }

    @Transactional(readOnly = true)
    public List<NominaResponse> historialPagos(Long empleadoId) {
        if (!empleadoRepository.existsById(empleadoId)) {
            throw new RecursoNoEncontradoException("Empleado", empleadoId);
        }
        return nominaRepository.findByEmpleadoIdOrderByFechaDesc(empleadoId)
                .stream()
                .map(NominaResponse::desde)
                .toList();
    }

    // ------------- helpers -------------

    private EmpleadoResponse toResponse(Empleado empleado) {
        Integer diasPagados = nominaRepository.sumDiasPagadosByEmpleadoId(empleado.getId());
        return EmpleadoResponse.desde(empleado, diasPagados);
    }

    private Map<Long, Integer> cargarDiasPagados(List<Empleado> empleados) {
        Map<Long, Integer> map = new HashMap<>();
        if (empleados.isEmpty()) return map;
        List<Long> ids = empleados.stream().map(Empleado::getId).toList();
        for (Object[] row : nominaRepository.sumDiasPagadosGroupByEmpleadoIds(ids)) {
            Long id = (Long) row[0];
            Number sum = (Number) row[1];
            map.put(id, sum == null ? 0 : sum.intValue());
        }
        return map;
    }
}
