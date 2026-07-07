package com.abhay.lms.service;

import com.abhay.lms.dto.CourseRequestDTO;
import com.abhay.lms.dto.CourseResponseDTO;

import java.util.List;

public interface CourseService {
    CourseResponseDTO create(CourseRequestDTO request);
    List<CourseResponseDTO> getAll();
    CourseResponseDTO getById(Long id);
    CourseResponseDTO update(Long id, CourseRequestDTO request);
    void delete(Long id);
}
