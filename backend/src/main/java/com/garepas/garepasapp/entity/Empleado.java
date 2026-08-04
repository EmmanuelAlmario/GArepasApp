package com.garepas.garepasapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "empleados", uniqueConstraints = {
        @UniqueConstraint(name = "uk_empleados_nombre", columnNames = "nombre")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioDia;

    @Column(nullable = false)
    @Builder.Default
    private Integer diasTrabajados = 0;

    @Column(nullable = false)
    private Boolean activo;

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Nomina> nominas = new ArrayList<>();
}
