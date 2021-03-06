package cn.edu.hit.ices.yang.service;

import cn.edu.hit.ices.yang.mapper.TestMapper;
import cn.edu.hit.ices.yang.model.Test;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Resource
    private TestMapper testMapper;

    @Override
    public Test getUserByUsername(String name){
        try {
            return testMapper.selectUserByUserName(name);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Test> getAllUsers(String name){
        try {
            return testMapper.selectAllUsers(name);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}
