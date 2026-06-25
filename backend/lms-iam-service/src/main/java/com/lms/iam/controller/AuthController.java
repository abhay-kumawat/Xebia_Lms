package com.lms.iam.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.lms.common.util.ApiResponse;
import com.lms.iam.entity.User;
import com.lms.iam.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/iam")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository repo; // Changed to repo to be less verbose

    @GetMapping("/users/check")
    public ApiResponse<Map<String, Object>> checkEmail(@RequestParam String email) {
        // refactor later: trim and lowercasing should maybe be done inside the request mapping filter
        String cleanMail = email.trim().toLowerCase();
        Optional<User> uOpt = repo.findByEmail(cleanMail);
        Map<String, Object> res = new HashMap<>();
        
        try {
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                res.put("exists", true);
                res.put("name", u.getName());
                res.put("role", u.getRole());
                return ApiResponse.success("User verified in identity registry", res);
            } else {
                res.put("exists", false);
                return ApiResponse.success("Email not found, user is a new registration", res);
            }
        } catch (Exception ex) {
            // lazy catch-all if db goes down or something weird happens
            res.put("exists", false);
            return ApiResponse.success("Error checking user: " + ex.getMessage(), res);
        }
    }

    @PostMapping("/auth/google-signin")
    public ApiResponse<Map<String, Object>> googleSignIn(@RequestBody Map<String, String> payload) {
        String email = payload.get("email").trim().toLowerCase();
        String name = payload.get("name");
        String role = payload.getOrDefault("role", "student");

        // TODO: we should verify the google oauth token on backend side, not just trust the payload!
        
        User user = null;
        try {
            Optional<User> opt = repo.findByEmail(email);
            if (opt.isPresent()) {
                user = opt.get();
            } else {
                User newUser = new User(name, email, role, "Active");
                user = repo.save(newUser);
            }
        } catch (org.springframework.dao.DataAccessException dbEx) {
            // DB issues? throw standard runtime exception
            throw new RuntimeException("Database error during sign-in", dbEx);
        }

        // if name changed, update it
        if (user != null && !user.getName().equals(name)) {
            user.setName(name);
            user = repo.save(user);
        }

        // generates simulated jwt for frontend
        String tok = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJzdWIiOiJ" + user.getEmail() + "\",\"name\":\"" + user.getName() + "\",\"role\":\"" + user.getRole() + "\"}." +
                "signature_placeholder";

        Map<String, Object> data = new HashMap<>();
        data.put("token", tok);
        data.put("user", user);

        return ApiResponse.success("Google Authentication complete. Exchanged security token for JWT.", data);
    }

    // --- USER PROFILE CRUD ENDPOINTS ---

    @GetMapping("/users")
    public ApiResponse<java.util.List<User>> getAllUsers() {
        try {
            // refactor: add pagination limit later
            return ApiResponse.success("Fetched all registered users", repo.findAll());
        } catch (Exception ex) {
            throw new RuntimeException("Could not retrieve users list", ex);
        }
    }

    @PostMapping("/users")
    public ApiResponse<User> createUser(@RequestBody User u) {
        try {
            if (repo.findByEmail(u.getEmail().trim().toLowerCase()).isPresent()) {
                throw new IllegalArgumentException("User email already registered");
            }
            u.setEmail(u.getEmail().trim().toLowerCase());
            if (u.getStatus() == null) {
                u.setStatus("Active");
            }
            User saved = repo.save(u);
            return ApiResponse.success("New user profile provisioned successfully", saved);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to provision new user", ex);
        }
    }

    @PutMapping("/users/{id}")
    public ApiResponse<User> editUser(@PathVariable Long id, @RequestBody User userDetails) {
        // TODO: check admin credentials session scope
        try {
            Optional<User> uOpt = repo.findById(id);
            if (uOpt.isPresent()) {
                User dbUser = uOpt.get();
                dbUser.setName(userDetails.getName());
                dbUser.setEmail(userDetails.getEmail().trim().toLowerCase());
                dbUser.setRole(userDetails.getRole());
                dbUser.setStatus(userDetails.getStatus());
                User updated = repo.save(dbUser);
                return ApiResponse.success("User profile updated successfully", updated);
            } else {
                throw new IllegalArgumentException("Target user ID not found");
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to edit user profile", ex);
        }
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<String> removeUser(@PathVariable Long id) {
        try {
            if (repo.existsById(id)) {
                repo.deleteById(id);
                return ApiResponse.success("User identity removed from gateway", "Deleted user " + id);
            } else {
                throw new IllegalArgumentException("User ID does not exist");
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to delete user profile", ex);
        }
    }
}
