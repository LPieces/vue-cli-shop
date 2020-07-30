<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatat_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录区域 -->
                <el-form ref="loginFormRef" class="login_form"  :rules="loginFormRules" :model="loginForm">
                    <!-- 用户名 -->
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                    </el-form-item>
                    <!-- 密码 -->
                    <el-form-item prop="password">
                        <el-input show-password v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
                    </el-form-item>
                    <!-- 按钮 -->
                    <el-form-item class="btns">
                        <el-button type="primary" @click="login">登录</el-button>
                        <el-button type="info" @click="resetLoginForm">重置</el-button>
                    </el-form-item>
                </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // z这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 这是表单的验证规则对象
            loginFormRules: {
                // 用户名
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ],
                // 密码
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: ['blur', 'change'] }
                ]
            }
        }
    },
    methods: {
        // 登录
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return false
                // this可以访问到原型上的axios
                const { data: res } = await this.$axios.post('login', this.loginForm)
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                // 将服务器返回的token保存到sessionStorage中
                window.sessionStorage.setItem('token', res.data.token)
                // 跳转到首页
                this.$router.push('/home')
            })
        },
        // 重置
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields()
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatat_box{
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        background-color: #fff;
        box-shadow: 0 0 10px #ddd;
        position:absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>
