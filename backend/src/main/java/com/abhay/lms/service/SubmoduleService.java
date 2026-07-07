package com.abhay.lms.service;

import com.abhay.lms.dto.SubmoduleRequestDTO;
import com.abhay.lms.dto.SubmoduleResponseDTO;

import java.util.List;

public interface SubmoduleService {
    SubmoduleResponseDTO create(SubmoduleRequestDTO request);
    List<SubmoduleResponseDTO> getAll();
    SubmoduleResponseDTO getById(Long id);
    SubmoduleResponseDTO update(Long id, SubmoduleRequestDTO request);
    void delete(Long id);
}

