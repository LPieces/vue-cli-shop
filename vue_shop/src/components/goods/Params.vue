<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-alert title="注意：只允许第三级分类设置相关参数！"
            type="warning" show-icon :closable="false"></el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <!-- 级联选择器区域 -->
                    <span>选择商品分类：
                        <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                        @change="getParamsData"></el-cascader>
                    </span>
                </el-col>
            </el-row>
            <!-- 标签页区域 -->
            <el-tabs v-model="activeName" @tab-click="getParamsData">
                <!-- 动态参数区域 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态属性区域 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑参数对话框 -->
        <el-dialog
        :title="'编辑' + titleText"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 分类列表
            cateList: [],
            // 级联选择器的数据数组
            selectedCateKeys: [],
            // 活跃的标签页
            activeName: 'many',
            // 动态参数数据数组
            manyTableData: [],
            // 静态属性数据数组
            onlyTableData: [],
            // 添加对话框
            addDialogVisible: false,
            // 编辑对话框
            editDialogVisible: false,
            // 添加参数数据对象
            addForm: {
                attr_name: ''
            },
            // 添加参数数据验证规则对象
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 编辑参数数据对象
            editForm: {
                attr_name: ''
            },
            // 编辑参数数据验证规则对象
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取分类列表
        async getCateList() {
            const { data: res } = await this.$axios.get('categories')
            if (res.meta.status !== 200) return this.$message(res.meta.msg)
            this.cateList = res.data
        },
        // 获取参数列表函数
        async getParamsData() {
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return false
            }
            const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName }
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 控制文本框的显示与隐藏
                item.inputVisible = false
                item.inputValue = ''
            })
            if (this.activeName === 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        // 添加参数对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 保存添加参数
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.getParamsData()
                this.addDialogVisible = false
                this.$message.success(res.meta.msg)
            })
        },
        // 显示编辑对话框
        async showEditDialog(attrId) {
            const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes/${attrId}`, {
                params: { attr_sel: this.activeName }
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.editForm = res.data
            console.log(this.editForm)
            this.editDialogVisible = true
        },
        // 编辑对话框关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 保存编辑参数
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        // 根据Id删除对应的参数
        async removeParams(attrId) {
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const { data: res } = await this.$axios.delete(`categories/${this.cateId}/attributes/${attrId}`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getParamsData()
        },
        // 显示文本框
        showInput(row) {
            row.inputVisible = true
            this.$nextTick(_ => {
            // 让文本自己动获得焦点
            // nextTick方法的作用是当页面元素被重新渲染之后,才会指定回调函数中的代码
            this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 文本框失去焦点或按下回车触发
        handleInputConfirm(row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return false
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            this.saveAttrVals(row)
        },
        // 删除对应tag
        handleClose(i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        },
        // 保存tag函数
        async saveAttrVals(row) {
            const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
        }
    },
    computed: {
        // 计算控制添加参数/属性按钮的禁用与启用
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) return true
            return false
        },
        // 计算Id
        cateId() {
            if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
            return null
        },
        // 计算对话框标题
        titleText() {
            if (this.activeName === 'many') return '动态参数'
            return '静态属性'
        }
    }
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px 0px;
}
.el-cascader{
    width: 250px;
}
.el-tag{
    margin: 8px;
}
.input-new-tag{
    width: 120px;
}
</style>
