package com.garepas.garepasapp.exception;

public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(String insumo, String requerido, String disponible) {
        super("Stock insuficiente para el insumo '" + insumo + "'. Requerido: " + requerido + ", Disponible: " + disponible);
    }
}
