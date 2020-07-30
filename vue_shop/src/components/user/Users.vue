<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" clearable
                    v-model="queryInfo.query" @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="5">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <el-table :data="userlist" border stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[4, 6, 8, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background>
            </el-pagination>
            <!--添加用户对话框-->
            <el-dialog title="添加用户" :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" show-password></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
            </el-dialog>
            <!--编辑用户对话框-->
            <el-dialog title="修改用户信息" :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
            <div>
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role_name }}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        var checkMobile = (rule, value, cb) => {
                const regMobile = /^1[3456789]\d{9}$/
                if (regMobile.test(value)) {
                    return cb()
                }
                cb(new Error('请输入正确的手机号码'))
        }
        return {
            queryInfo: {
                query: '',
                // 当前的页数
                pagenum: 1,
                // 显示条数
                pagesize: 4
            },
            userlist: [],
            total: 0,
            addDialogVisible: false,
            editDialogVisible: false,
            // 添加用户数据对象
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: ['blur', 'change'] }
                ],
                email: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: ['blur', 'change'] }
                ]
            },
            editForm: {
                username: '',
                email: '',
                mobile: ''
            },
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: ['blur', 'change'] }
                ]
            },
            setRoleDialogVisible: false,
            userInfo: {},
            rolesList: [],
            selectedRoleId: ''
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$axios.get('users', {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) return this.$mmessage.error('获取用户列表失败')
            this.userlist = res.data.users
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        async userStateChanged(userInfo) {
            const { data: res } = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败')
            }
            userInfo.mg_state ? this.$message.success('该用户已启用') : this.$message.info('该用户已禁用')
        },
        // 监听添加用户的对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮添加用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.post('users', this.addForm)
                if (res.meta.status !== 201) this.$message.error(res.meta.msg)
                this.$message.success('添加用户成功')
                this.addDialogVisible = false
                this.getUserList()
            })
        },
        // 显示修改用户对话框
        async showEditDialog(id) {
            const { data: res } = await this.$axios.get('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改用户的对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮修改用户
        editUser() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.put('users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.editDialogVisible = false
                this.getUserList()
            })
        },
        // 根基ID删除用户
        async removeUserById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const { data: res } = await this.$axios.delete('users/' + id)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getUserList()
        },
        async setRole(userInfo) {
            this.userInfo = userInfo
            // 获取角色列表
            const { data: res } = await this.$axios.get('roles')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rolesList = res.data
            this.setRoleDialogVisible = true
        },
        // 点击按钮分配角色
        async saveRoleInfo() {
            if (!this.selectedRoleId) return this.$message.error('请选择分配角色')
            const { data: res } = await this.$axios.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getUserList()
            this.setRoleDialogVisible = false
            this.selectedRoleId = ''
            this.userInfo = {}
        }
    },
    computed: {
        indexMethod: function() {
            return (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize + 1
        }
    }
}
</script>

<style lang="less" scoped>

</style>
