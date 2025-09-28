package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.FunctionDTO;
import com.internsystem.internmanagement.entity.Function;
import com.internsystem.internmanagement.entity.Module;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.mapper.FunctionMapper;
import com.internsystem.internmanagement.repository.FunctionRepository;
import com.internsystem.internmanagement.repository.ModuleRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FunctionService {

    @Autowired
    private FunctionRepository functionRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private InternRepository internRepository;

    public List<FunctionDTO> getAllFunctions() {
        return functionRepository.findAll()
                .stream()
                .map(FunctionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<FunctionDTO> getFunctionsByModuleId(Long moduleId) {
        return functionRepository.findByModuleModuleId(moduleId)
                .stream()
                .map(FunctionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public FunctionDTO createFunction(FunctionDTO dto) {
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));
        Intern developerIntern = null;
        if (dto.getDeveloperInternId() != null) {
            developerIntern = internRepository.findById(dto.getDeveloperInternId())
                    .orElseThrow(() -> new RuntimeException("Developer Intern not found"));
        }
        Function function = FunctionMapper.toEntity(dto, module, developerIntern);
        Function saved = functionRepository.save(function);
        return FunctionMapper.toDTO(saved);
    }

    public Optional<FunctionDTO> getFunctionById(Long id) {
        return functionRepository.findById(id).map(FunctionMapper::toDTO);
    }

    public FunctionDTO updateFunction(Long id, FunctionDTO dto) {
        Function function = functionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Function not found"));
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));
        Intern developerIntern = null;
        if (dto.getDeveloperInternId() != null) {
            developerIntern = internRepository.findById(dto.getDeveloperInternId())
                    .orElseThrow(() -> new RuntimeException("Developer Intern not found"));
        }
        function.setFunctionName(dto.getFunctionName());
        function.setDescription(dto.getDescription());
        function.setModule(module);
        function.setDeveloperIntern(developerIntern);
        function.setStatus(dto.getStatus());
        Function saved = functionRepository.save(function);
        return FunctionMapper.toDTO(saved);
    }

    public void deleteFunction(Long id) {
        functionRepository.deleteById(id);
    }
}