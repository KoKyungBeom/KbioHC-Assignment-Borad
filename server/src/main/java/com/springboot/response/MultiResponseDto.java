package com.springboot.response;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class MultiResponseDto<T, K> {
    private List<T> data;
    private List<K> notices;
    private PageInfo pageInfo;

    public MultiResponseDto(List<T> data, Page page) {
        this.data = data;
        this.pageInfo = new PageInfo(page.getNumber() + 1,
                page.getSize(),page.getTotalElements(),page.getTotalPages());
    }
    public MultiResponseDto(List<T> data, List<K> notices, Page page) {
        this.data = data;
        this.notices = notices;
        this.pageInfo = new PageInfo(page.getNumber() + 1,
                page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
