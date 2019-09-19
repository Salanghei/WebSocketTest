package cn.edu.hit.ices.yang.model;

public class Test {
    private int id;           // 用户ID
    private String name;      // 用户名
    private String password;  // 密码
    private int mesCount = 0;     // 未读消息数量
    private boolean unRead = false;   // 是否存在未读消息

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getMesCount() {
        return mesCount;
    }

    public void setMesCount(int mesCount) {
        this.mesCount = mesCount;
    }

    public boolean isUnRead() {
        return unRead;
    }

    public void setUnRead(boolean unRead) {
        this.unRead = unRead;
    }
}
