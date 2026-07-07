package com.abhay.lms.repository;

import com.abhay.lms.entity.learning.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findAllByOrderByCreatedAtDesc();
}
