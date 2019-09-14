package cn.edu.hit.ices.yang.mapper;

import cn.edu.hit.ices.yang.model.Test;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("testMapper")
public interface TestMapper {
    Test selectUserByUserName(String name);

    List<Test> selectAllUsers(String name);
}
