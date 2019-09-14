package cn.edu.hit.ices.yang.controller;

import cn.edu.hit.ices.yang.model.Test;
import cn.edu.hit.ices.yang.service.UserService;
import com.alibaba.fastjson.JSON;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/user")
public class UserController {
    @Resource
    private UserService userService;

    @RequestMapping(path = "/login", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        HttpServletRequest request){
        Test user = userService.getUserByUsername(username);
        String message;
        if(user != null){
            // 用户存在，判断密码是否正确
            if(user.getPassword().equals(password)){
                if(request.getSession().getAttribute("user") != null){
                    request.getSession().removeAttribute("user");
                }
                message = "success";
                request.getSession().setAttribute("user", user);  // 设置Session
            }else{
                message = "wrongPassword";
            }
        }else{
            message = "userDoesNotExist";
        }
        Map<String, Object> map = new HashMap<>();
        map.put("message", message);
        String jsonString = JSON.toJSONString(map);
        System.out.println(jsonString);
        return jsonString;
    }

    @RequestMapping(value = "/allUsers", method = RequestMethod.GET)
    @ResponseBody
    public String allUsers(HttpServletRequest request){
        Test user = (Test)request.getSession().getAttribute("user");
        List<Test> userList = userService.getAllUsers(user.getName());
        Map<String, Object> map = new HashMap<>();
        map.put("userList", userList);
        map.put("myUser", user);
        String jsonString = JSON.toJSONString(map);
        return jsonString;
    }
}
