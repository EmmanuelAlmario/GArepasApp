package com.garepas.garepasapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FlujoCompletoTest {

    @Autowired private TestRestTemplate rest;
    @Autowired private ObjectMapper mapper;

    private HttpHeaders conAuth(String token) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    private String login(String username, String password) {
        ResponseEntity<String> r = rest.postForEntity("/api/auth/login",
                Map.of("username", username, "password", password), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(200);
        try {
            return new ObjectMapper().readTree(r.getBody()).get("token").asText();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private JsonNode post(String url, String token, Object body) {
        ResponseEntity<String> r = rest.exchange(url, HttpMethod.POST,
                new HttpEntity<>(body, conAuth(token)), String.class);
        try {
            return mapper.readTree(r.getBody());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ---------- Autenticación y seguridad ----------

    @Test
    void login_admin_conPasswordCorrecta_daToken() {
        String token = login("admin", "admin123");
        assertThat(token).isNotBlank();
    }

    @Test
    void login_conPasswordIncorrecta_da401() {
        ResponseEntity<String> r = rest.postForEntity("/api/auth/login",
                Map.of("username", "admin", "password", "malasana"), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(401);
        assertThat(r.getBody()).contains("Usuario o contraseña incorrectos");
    }

    @Test
    void accesoSinToken_da401() {
        ResponseEntity<String> r = rest.getForEntity("/api/usuarios", String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void rutaInexistente_da404() {
        String token = login("admin", "admin123");
        ResponseEntity<String> r = rest.exchange("/api/no-existe", HttpMethod.GET,
                new HttpEntity<>(conAuth(token)), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void rolVentas_noPuedeAdministrarUsuarios() {
        String tokenAdmin = login("admin", "admin123");
        JsonNode creado = post("/api/usuarios", tokenAdmin,
                Map.of("username", "cajero1", "password", "secreta123", "rol", "VENTAS", "activo", true));
        assertThat(creado.get("username").asText()).isEqualTo("cajero1");

        String tokenCajero = login("cajero1", "secreta123");

        ResponseEntity<String> r = rest.exchange("/api/usuarios", HttpMethod.GET,
                new HttpEntity<>(conAuth(tokenCajero)), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void fuerzaBruta_bloqueaTrasCincoFallos() {
        String tokenAdmin = login("admin", "admin123");
        post("/api/usuarios", tokenAdmin,
                Map.of("username", "bloqueado1", "password", "secreta123", "rol", "VENTAS", "activo", true));

        for (int i = 0; i < 5; i++) {
            rest.postForEntity("/api/auth/login",
                    Map.of("username", "bloqueado1", "password", "incorrect"), String.class);
        }

        ResponseEntity<String> sexto = rest.postForEntity("/api/auth/login",
                Map.of("username", "bloqueado1", "password", "secreta123"), String.class);
        assertThat(sexto.getStatusCode().value()).isEqualTo(400);
        assertThat(sexto.getBody()).contains("Demasiados intentos");
    }

    @Test
    void usuarioInexistente_noRevelaDetalle() {
        ResponseEntity<String> r = rest.postForEntity("/api/auth/login",
                Map.of("username", "usuario-inexistente", "password", "x"), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(401);
    }

    // ---------- Flujo de negocio: jornada → producto → venta → arqueo → reporte ----------

    @Test
    void flujoJornadaProductoVentaReporte() throws Exception {
        String token = login("admin", "admin123");

        // 0. Crear usuario con rol VENTAS
        post("/api/usuarios", token,
                Map.of("username", "cajero2", "password", "secreta123", "rol", "VENTAS", "activo", true));

        // 1. Crear producto
        ResponseEntity<String> p = rest.exchange("/api/productos", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombre", "Arepa test", "stockActual", 10,
                        "stockMinimo", 2, "precioVenta", 3000, "activo", true), conAuth(token)), String.class);
        assertThat(p.getStatusCode().value()).isEqualTo(201);
        Long productoId = mapper.readTree(p.getBody()).get("id").asLong();

        // 2. Abrir jornada
        ResponseEntity<String> jornadaResp = rest.exchange("/api/jornadas", HttpMethod.POST,
                new HttpEntity<>(conAuth(token)), String.class);
        assertThat(jornadaResp.getStatusCode().value()).isEqualTo(201);
        Long jornadaId = mapper.readTree(jornadaResp.getBody()).get("id").asLong();
        assertThat(mapper.readTree(jornadaResp.getBody()).get("activa").asBoolean()).isTrue();

        // 3. Vender 2 unidades (el rol VENTAS también puede)
        String tokenCajero = login("cajero2", "secreta123");
        ResponseEntity<String> ventaResp = rest.exchange("/api/ventas", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombreCliente", "Pepe", "detalles",
                        java.util.List.of(Map.of("productoId", productoId, "cantidad", 2))),
                        conAuth(tokenCajero)),
                String.class);
        assertThat(ventaResp.getStatusCode().value()).isEqualTo(201);
        JsonNode venta = mapper.readTree(ventaResp.getBody());
        assertThat(venta.get("total").asInt()).isEqualTo(6000);

        // 4. El stock del producto bajó
        ResponseEntity<String> productoResp = rest.exchange("/api/productos/" + productoId,
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        assertThat(mapper.readTree(productoResp.getBody()).get("stockActual").asInt()).isEqualTo(8);

        // 5. Paginado de ventas
        ResponseEntity<String> pagResp = rest.exchange("/api/ventas/paginado?size=5&page=0",
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        JsonNode page = mapper.readTree(pagResp.getBody());
        assertThat(page.get("content").size()).isGreaterThanOrEqualTo(1);

        // 6. Historial de jornadas incluye el arqueo
        ResponseEntity<String> histResp = rest.exchange("/api/jornadas",
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        JsonNode historial = mapper.readTree(histResp.getBody()).get(0);
        assertThat(historial.get("nroVentas").asInt()).isEqualTo(1);
        assertThat(historial.get("totalVentas").asInt()).isEqualTo(6000);

        // 7. Reporte resumen
        ResponseEntity<String> repResp = rest.exchange("/api/reportes/resumen",
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        JsonNode resumen = mapper.readTree(repResp.getBody());
        assertThat(resumen.get("nroVentas").asInt()).isEqualTo(1);
        assertThat(resumen.get("ingresoTotal").asInt()).isEqualTo(6000);

        // 8. Cerrar jornada → arqueo
        ResponseEntity<String> cierreResp = rest.exchange("/api/jornadas/" + jornadaId + "/cerrar",
                HttpMethod.POST, new HttpEntity<>(conAuth(token)), String.class);
        JsonNode arqueo = mapper.readTree(cierreResp.getBody());
        assertThat(arqueo.get("activa").asBoolean()).isFalse();
        assertThat(arqueo.get("nroVentas").asInt()).isEqualTo(1);

        // 9. Auditoría quedó registrada
        ResponseEntity<String> auditResp = rest.exchange("/api/auditoria/paginado?page=0&size=10",
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        JsonNode audit = mapper.readTree(auditResp.getBody());
        assertThat(audit.get("totalElements").asLong()).isGreaterThan(0L);
    }

    // ---------- Validaciones y reglas de negocio ----------

    @Test
    void ventaSinDetalles_da400ConMensaje() {
        String token = login("admin", "admin123");
        ResponseEntity<String> r = rest.exchange("/api/ventas", HttpMethod.POST,
                new HttpEntity<>(Map.of("detalles", java.util.List.of()), conAuth(token)), String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(400);
        assertThat(r.getBody()).contains("al menos un producto");
    }

    @Test
    void productoDuplicadoDa409() {
        String token = login("admin", "admin123");
        rest.exchange("/api/productos", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombre", "Duplicado", "stockActual", 1,
                        "stockMinimo", 0, "precioVenta", 2000, "activo", true), conAuth(token)), String.class);
        ResponseEntity<String> r2 = rest.exchange("/api/productos", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombre", "Duplicado", "stockActual", 1,
                        "stockMinimo", 0, "precioVenta", 2000, "activo", true), conAuth(token)), String.class);
        assertThat(r2.getStatusCode().value()).isEqualTo(409);
    }

    @Test
    void stockNegativoALaVentaDa400() throws Exception {
        String token = login("admin", "admin123");
        ResponseEntity<String> p = rest.exchange("/api/productos", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombre", "Sin stock", "stockActual", 0,
                        "stockMinimo", 0, "precioVenta", 1000, "activo", true), conAuth(token)), String.class);
        Long id = mapper.readTree(p.getBody()).get("id").asLong();

        ResponseEntity<String> r = rest.exchange("/api/ventas", HttpMethod.POST,
                new HttpEntity<>(
                        java.util.Map.of("detalles",
                                java.util.List.of(java.util.Map.of("productoId", id, "cantidad", 1))),
                        conAuth(token)),
                String.class);
        assertThat(r.getStatusCode().value()).isEqualTo(400);
        assertThat(r.getBody()).contains("Stock insuficiente");
    }

    @Test
    void eliminarVentaRevierteStock() throws Exception {
        String token = login("admin", "admin123");
        ResponseEntity<String> p = rest.exchange("/api/productos", HttpMethod.POST,
                new HttpEntity<>(Map.of("nombre", "Reversible", "stockActual", 5,
                        "stockMinimo", 0, "precioVenta", 1000, "activo", true), conAuth(token)), String.class);
        Long id = mapper.readTree(p.getBody()).get("id").asLong();

        ResponseEntity<String> v = rest.exchange("/api/ventas", HttpMethod.POST,
                new HttpEntity<>(
                        java.util.Map.of("detalles",
                                java.util.List.of(java.util.Map.of("productoId", id, "cantidad", 2))),
                        conAuth(token)),
                String.class);
        Long ventaId = mapper.readTree(v.getBody()).get("id").asLong();

        // Eliminar la venta: el stock se revierte de 3 a 5
        rest.exchange("/api/ventas/" + ventaId, HttpMethod.DELETE,
                new HttpEntity<>(conAuth(token)), String.class);

        ResponseEntity<String> despues = rest.exchange("/api/productos/" + id,
                HttpMethod.GET, new HttpEntity<>(conAuth(token)), String.class);
        assertThat(mapper.readTree(despues.getBody()).get("stockActual").asInt()).isEqualTo(5);
    }
}