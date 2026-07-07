package com.abhay.lms.repository;

import com.abhay.lms.entity.learning.ContentEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<ContentEntity, Long> {

    @EntityGraph(attributePaths = {"submodule"})
    @Query("SELECT c FROM ContentEntity c")
    List<ContentEntity> findAllWithSubmodule();
}
