package cn.edu.hit.ices.yang.mapper;

import cn.edu.hit.ices.yang.model.Test;
import org.springframework.stereotype.Repository;

@Repository("testMapper")
public interface TestMapper {
    Test selectUserByUserName(String name);
}
