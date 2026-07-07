package com.abhay.lms.service;

import com.abhay.lms.dto.ContentRequestDTO;
import com.abhay.lms.dto.ContentResponseDTO;

import java.util.List;

public interface ContentService {
    ContentResponseDTO create(ContentRequestDTO request);
    List<ContentResponseDTO> getAll();
    ContentResponseDTO getById(Long id);
    ContentResponseDTO update(Long id, ContentRequestDTO request);
    void delete(Long id);
}

