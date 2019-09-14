package cn.edu.hit.ices.yang.service;

import cn.edu.hit.ices.yang.model.Test;

import java.util.List;

public interface UserService {
    Test getUserByUsername(String name);

    List<Test> getAllUsers(String name);
}
