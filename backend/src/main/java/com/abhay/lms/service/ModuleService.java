package com.abhay.lms.service;

import com.abhay.lms.dto.ModuleRequestDTO;
import com.abhay.lms.dto.ModuleResponseDTO;

import java.util.List;

public interface ModuleService {
    ModuleResponseDTO create(ModuleRequestDTO request);
    List<ModuleResponseDTO> getAll();
    ModuleResponseDTO getById(Long id);
    ModuleResponseDTO update(Long id, ModuleRequestDTO request);
    void delete(Long id);
}

