package org.example.licenta.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            Jws<Claims> claims = jwtService.validate(token);
            String userId = claims.getBody().getSubject();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.emptyList()
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            if (!isPublicRoute(request)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicRoute(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        return path.startsWith("/api/auth/") ||
                path.equals("/api/bookings/webhook") ||
                (path.equals("/api/parking-spot/search") && method.equals("GET")) ||
                (path.equals("/api/bookings/buyer") && method.equals("GET")) ||
                (path.matches("/api/users/.*/name") && method.equals("GET"));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return false;
    }
}