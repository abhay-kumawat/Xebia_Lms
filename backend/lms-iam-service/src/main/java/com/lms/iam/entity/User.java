package com.lms.iam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role; // student, trainer, manager, organiser, admin. maybe turn to enum later?

    @Column(nullable = false)
    private String status; // Active, Suspended - just a simple string flag for now

    // default constructor for jpa
    public User() {
    }

    public User(String n, String e, String r, String s) {
        this.name = n;
        this.email = e;
        this.role = r;
        this.status = s;
    }

    // Getters and Setters (manually written)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() { 
        return name; 
    }
    public void setName(String name) { 
        this.name = name; 
    }

    public String getEmail() { return email; }
    public void setEmail(String val) { this.email = val; } // inconsistent parameter naming

    public String getRole() {
        return this.role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
