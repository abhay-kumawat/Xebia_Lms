package com.abhay.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LMSBackendApplication {

    public static void main(String[] args) {
        try {
            java.io.File envFile = new java.io.File(".env");
            if (envFile.exists()) {
                java.util.Map<String, String> envVars = new java.util.HashMap<>();
                java.nio.file.Files.lines(envFile.toPath())
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .forEach(line -> {
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip outer quotes if present
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            // Set as system property (CLOUDINARY_CLOUD_NAME -> cloudinary.cloud-name etc.)
                            System.setProperty(key, value);
                            envVars.put(key, value);
                        }
                    });
                
                // Also explicitly map Cloudinary env-var keys to Spring property keys
                // so that @Value("${cloudinary.cloud-name}") resolves correctly
                if (envVars.containsKey("CLOUDINARY_CLOUD_NAME")) {
                    System.setProperty("cloudinary.cloud-name", envVars.get("CLOUDINARY_CLOUD_NAME"));
                }
                if (envVars.containsKey("CLOUDINARY_API_KEY")) {
                    System.setProperty("cloudinary.api-key", envVars.get("CLOUDINARY_API_KEY"));
                }
                if (envVars.containsKey("CLOUDINARY_API_SECRET")) {
                    System.setProperty("cloudinary.api-secret", envVars.get("CLOUDINARY_API_SECRET"));
                }
                
                System.out.println("[.env loader] Loaded env keys: " + envVars.keySet());
                System.out.println("[.env loader] cloudinary.cloud-name = " + System.getProperty("cloudinary.cloud-name"));
                System.out.println("[.env loader] cloudinary.api-key = " + System.getProperty("cloudinary.api-key"));
            } else {
                System.out.println("[.env loader] No .env file found, relying on environment variables.");
            }
        } catch (Exception e) {
            System.err.println("Failed to parse local .env file: " + e.getMessage());
        }

        // Print debug information during startup to help troubleshoot Render deployment
        String activeProfile = getEnvOrProperty("SPRING_PROFILES_ACTIVE");
        String port = getEnvOrProperty("PORT");
        String dbUrl = getEnvOrProperty("SPRING_DATASOURCE_URL");
        String dbUser = getEnvOrProperty("SPRING_DATASOURCE_USERNAME");
        String redisUrl = getEnvOrProperty("REDIS_URL");

        System.out.println("========================================================================");
        System.out.println("[LMS_backend Startup Check] Loaded environment parameters:");
        System.out.println("  Active Profile (SPRING_PROFILES_ACTIVE): " + (activeProfile != null ? activeProfile : "postgres (default)"));
        System.out.println("  Server Port (PORT):                     " + (port != null ? port : "8082 (default)"));
        System.out.println("  Database URL (SPRING_DATASOURCE_URL):   " + maskUrl(dbUrl));
        System.out.println("  Database Username (SPRING_DATASOURCE_USER): " + (dbUser != null ? dbUser : "NOT SET"));
        System.out.println("  Redis URL (REDIS_URL):                 " + maskUrl(redisUrl));
        System.out.println("========================================================================");

        SpringApplication.run(LMSBackendApplication.class, args);
    }

    private static String getEnvOrProperty(String key) {
        String val = System.getProperty(key);
        if (val == null || val.trim().isEmpty()) {
            val = System.getenv(key);
        }
        return val;
    }

    private static String maskUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "NOT SET";
        }
        try {
            // Mask password in connection string: e.g. jdbc:postgresql://username:password@host:port/db
            // or redis://:password@host:port
            return url.replaceAll("(:[^@/:]+)@", ":******@");
        } catch (Exception e) {
            return "SET (Failed to mask)";
        }
    }
}
