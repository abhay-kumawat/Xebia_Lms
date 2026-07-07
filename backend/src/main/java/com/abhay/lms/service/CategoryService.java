package com.abhay.lms.service;

import com.abhay.lms.dto.CategoryRequestDTO;
import com.abhay.lms.dto.CategoryResponseDTO;
import com.abhay.lms.dto.CategoryWiseCourseResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO request);
    List<CategoryResponseDTO> getAll();
    CategoryResponseDTO getById(Long id);
    CategoryWiseCourseResponseDTO getCategoryCourses(Long categoryId);
    CategoryResponseDTO update(Long id, CategoryRequestDTO request);
    void delete(Long id);
}

