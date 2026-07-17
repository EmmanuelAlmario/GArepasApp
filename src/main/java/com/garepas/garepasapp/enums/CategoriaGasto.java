package com.garepas.garepasapp.enums;

/**
 * Categorías canónicas de un Gasto. Se persisten como String en la BD para
 * permitir migración progresiva desde valores libres previos.
 */
public enum CategoriaGasto {
    MATERIA_PRIMA("Materia Prima"),
    NOMINA_PERSONAL("Nómina y Personal"),
    SERVICIOS("Servicios"),
    TRANSPORTE("Transporte"),
    EQUIPAMIENTO("Equipamiento"),
    MANTENIMIENTO("Mantenimiento"),
    OTROS("Otros");

    private final String etiqueta;

    CategoriaGasto(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    /**
     * Convierte un valor libre / legacy string a la categoría canónica.
     */
    public static CategoriaGasto desdeTexto(String raw) {
        if (raw == null || raw.isBlank()) return OTROS;
        String norm = raw.trim().toLowerCase();
        for (CategoriaGasto c : values()) {
            if (c.name().equalsIgnoreCase(raw.trim())) return c;
            if (c.etiqueta.equalsIgnoreCase(raw.trim())) return c;
        }
        if (norm.contains("nomin") || norm.contains("personal") || norm.contains("sueldo") || norm.contains("pago"))
            return NOMINA_PERSONAL;
        if (norm.contains("materia") || norm.contains("insumo") || norm.contains("ingrediente"))
            return MATERIA_PRIMA;
        if (norm.contains("servic") || norm.contains("luz") || norm.contains("agua") || norm.contains("gas") || norm.contains("internet"))
            return SERVICIOS;
        if (norm.contains("transporte") || norm.contains("gasolina") || norm.contains("combustible") || norm.contains("flete"))
            return TRANSPORTE;
        if (norm.contains("equip") || norm.contains("herramient") || norm.contains("máquina") || norm.contains("maquina"))
            return EQUIPAMIENTO;
        if (norm.contains("manten") || norm.contains("reparaci"))
            return MANTENIMIENTO;
        return OTROS;
    }
}
