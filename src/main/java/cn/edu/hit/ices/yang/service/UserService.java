package cn.edu.hit.ices.yang.service;

import cn.edu.hit.ices.yang.model.Test;

public interface UserService {
    Test getUserByUsername(String name);
}
