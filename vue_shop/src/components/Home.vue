<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/logo2.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu background-color="#373d41" text-color="#fff" active-text-color="#409eff"
                unique-opened :collapse-transition="false" :collapse="isCollapse" router :default-active="activePath">
                    <!-- 一级菜单区域 -->
                    <el-submenu v-for="item in menulist" :key="item.id" :index="item.id+''">
                        <!-- 一级菜单模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>

                        <!-- 二级菜单区域 -->
                        <el-menu-item v-for="subItem in item.children" :key="subItem.id"
                        :index="'/' + subItem.path" @click="saveNavState('/' + subItem.path)">
                            <!-- 二级菜单模板区域 -->
                                <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧区域 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            menulist: [],
            iconObj: {
                125: 'iconfont icon-users',
                103: 'iconfont icon-tijikongjian',
                101: 'iconfont icon-shangpin',
                102: 'iconfont icon-danju',
                145: 'iconfont icon-baobiao'
            },
            isCollapse: false,
            activePath: ''
        }
    },
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            window.sessionStorage.clear()
            this.$message.success('退出成功')
            this.$router.push('/login')
        },
        async getMenuList() {
            const { data: res } = await this.$axios.get('menus')
            if (res.meta.status !== 200) this.$message(res.meta.msg)
            this.menulist = res.data
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        }
    }
}
</script>

<style lang="less" scoped>
.home-container{
    height: 100%;
}
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    div {
        display: flex;
        align-items: center;
        span {
            margin-left: 10px;
        }
    }
}
.el-aside{
    background-color: #373d41;
    .el-menu{
        border-right: none;
    }
}
.el-submenu__title *{
    vertical-align: baseline;
}
.el-menu-item{
    span{
        vertical-align: baseline;
    }
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: #4a5064;
    font-size: 11px;
    height: 24px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing:0.2em;
    cursor: pointer;
    padding-bottom: 2px;
}
</style>
