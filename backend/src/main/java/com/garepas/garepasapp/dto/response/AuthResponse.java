package com.garepas.garepasapp.dto.response;

public record AuthResponse(
        String token,
        String username,
        String rol
) {}