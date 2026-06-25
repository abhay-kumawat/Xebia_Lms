package com.lms.iam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lms.iam.entity.User;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// DB queries for user auth/profile tables
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
