package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.FunctionDTO;
import com.internsystem.internmanagement.entity.Function;
import com.internsystem.internmanagement.entity.Module;
import com.internsystem.internmanagement.entity.Intern;

public class FunctionMapper {

    public static FunctionDTO toDTO(Function function) {
        FunctionDTO dto = new FunctionDTO();
        dto.setFunctionId(function.getFunctionId());
        dto.setFunctionName(function.getFunctionName());
        dto.setDescription(function.getDescription());
        if (function.getModule() != null) {
            dto.setModuleId(function.getModule().getModuleId());
            dto.setModuleName(function.getModule().getModuleName());
        }
        if (function.getDeveloperIntern() != null) {
            dto.setDeveloperInternId(function.getDeveloperIntern().getInternId());
            dto.setDeveloperInternName(function.getDeveloperIntern().getName());
        }
        dto.setStatus(function.getStatus());
        return dto;
    }

    public static Function toEntity(FunctionDTO dto, Module module, Intern developerIntern) {
        Function function = new Function();
        function.setFunctionId(dto.getFunctionId());
        function.setFunctionName(dto.getFunctionName());
        function.setDescription(dto.getDescription());
        function.setModule(module);
        function.setDeveloperIntern(developerIntern);
        function.setStatus(dto.getStatus());
        return function;
    }
}