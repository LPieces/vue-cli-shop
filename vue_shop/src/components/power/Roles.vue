<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['vcenter bdbottom', i1 === 0 ? 'bdtop' : '']">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="['vcenter', i2 === 0 ? '' : 'bdtop']">
                                    <el-col :span="6">
                                        <el-tag type="success" @close="removeRightById(scope.row, item2.id)" closable>{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag @close="removeRightById(scope.row, item3.id)" type="warning" v-for="(item3, i3) in item2.children" :key="item3.id"
                                        :class="[i3 === 0 ? '' : 'bdtop']" closable>{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row   )">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--添加角色对话框-->
            <el-dialog title="添加角色" :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
            </el-dialog>
        <!--编辑角色对话框-->
            <el-dialog title="编辑角色信息" :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 分配权限对话框 -->
            <el-dialog title="分配权限"
            :visible.sync="SetRightDialogVisible" width="50%" @close="SetRightDialogClosed">
            <el-tree node-key="id" :data="rightsList"
            :props="treeProps" :default-checked-keys="defKeys"
            show-checkbox default-expand-all ref="treeRef"></el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="SetRightDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="allotRights">确 定</el-button>
                </span>
            </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rolesList: [],
            addDialogVisible: false,
            editDialogVisible: false,
            // 添加角色数据对象
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色描述长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ]
            },
            editForm: {
                roleName: '',
                roleDesc: ''
            },
            editFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色描述长度在 3 到 10 个字符', trigger: ['blur', 'change'] }
                ]
            },
            SetRightDialogVisible: false,
            rightsList: [],
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            defKeys: [],
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$axios.get('roles')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rolesList = res.data
        },
        // 监听添加角色的对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
         // 点击按钮添加角色
        addRole() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.post('roles', this.addForm)
                if (res.meta.status !== 201) this.$message.error(res.meta.msg)
                this.$message.success('添加角色成功')
                this.addDialogVisible = false
                this.getRolesList()
            })
        },
        // 显示编辑角色对话框
        async showEditDialog(id) {
            const { data: res } = await this.$axios.get('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听编辑角色的对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 根基ID删除角色
        async removeRoleById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const { data: res } = await this.$axios.delete('roles/' + id)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getRolesList()
        },
        // 点击按钮修改角色
        editRole() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.put('roles/' + this.editForm.roleId, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.editDialogVisible = false
                this.getRolesList()
            })
        },
        // 根据ID删除对应的权限
        async removeRightById(role, rightId) {
            const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return false
            const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            role.children = res.data
        },
        // 显示分配权限对话框
        async showSetRightDialog(role) {
            this.roleId = role.id
            // 获取权限数据
            const { data: res } = await this.$axios.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rightsList = res.data
            this.getLeafKeys(role, this.defKeys)
            this.SetRightDialogVisible = true
        },
        getLeafKeys(node, arr) {
            if (!node.children) return arr.push(node.id)
            node.children.forEach(item => this.getLeafKeys(item, arr))
        },
        SetRightDialogClosed() {
            this.defKeys = []
        },
        // 点击分配权限
        async allotRights() {
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.SetRightDialogVisible = false
            this.getRolesList()
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
