package cn.edu.hit.ices.yang;

import com.sun.org.apache.xpath.internal.operations.Mod;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

/**
 * 做个页面和控制器
 */
@Controller
public class WebSocketController {
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView goIndex(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("index");
        return mv;
    }
}
