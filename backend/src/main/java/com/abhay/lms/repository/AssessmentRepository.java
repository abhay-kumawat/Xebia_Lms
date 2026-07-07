package com.abhay.lms.repository;

import com.abhay.lms.entity.learning.AssessmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<AssessmentEntity, Long> {
}
