import request from '../util/request.js'
// 登录
export function login(username, password) {
    return request.post("/employee/login",{
        username,
        password,
    })
}

//注册
export function register(email,realName,password,code,role) {
    return request.post("/employee/register",{
        email,
        realName,
        password,
        code,
        role
    })
}

//发送验证码
export function getCode(email) {
    return request.post("/employee/register/code",{
        email
    })
}
//修改密码
export function editPassword(empId, newPassword,oldPassword) {
    return request.put("/employee/editPassword",{
        empId,
        newPassword,
        oldPassword
    })
}