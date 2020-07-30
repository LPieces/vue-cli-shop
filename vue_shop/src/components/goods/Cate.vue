<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table class="tree-table" :data="catelist" :columns="columns"
            :selection-type="false" :expand-type="false"
            show-index index-text="#" border :show-row-hover="false">
            <template slot="isok" slot-scope="scope">
                <i style="color:lightgreen;" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
                <i style="color:red;" class="el-icon-error" v-else></i>
            </template>
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="DeleteCateDialog(scope.row.cat_id)" size="mini">删除</el-button>
            </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background>
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog
        title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                @change="parentCateChanged" clearable change-on-select></el-cascader>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类对话框 -->
        <el-dialog
        title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
            <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            catelist: [],
            total: 0,
            columns: [
                {
                label: '分类名称',
                prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                }
            ],
            addCateDialogVisible: false,
            editCateDialogVisible: false,
            addCateForm: {
                // 添加分类的名称
                cat_name: '',
                // 父级分类的id
                cat_pid: 0,
                // 添加分类的等级
                cat_level: 0
            },
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类列表
            parentCateList: [],
            selectedKeys: [],
            editCateForm: {
                cat_name: ''
            },
            editCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.catelist = res.data.result
            this.total = res.data.total
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        showAddCateDialog() {
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        async getParentCateList() {
            const { data: res } = await this.$axios.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.parentCateList = res.data
        },
        parentCateChanged() {
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
                return false
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        async showEditCateDialog(id) {
            const { data: res } = await this.$axios.get('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            this.editCateForm = res.data
            this.editCateDialogVisible = true
        },
        editCate() {
            this.$refs.editCateFormRef.validate(async valid => {
                if (!valid) return false
                const { data: res } = await this.$axios.put('categories/' + this.editCateForm.cat_id, {
                    cat_name: this.editCateForm.cat_name
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.editCateDialogVisible = false
                this.getCateList()
            })
        },
        async DeleteCateDialog(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const { data: res } = await this.$axios.delete('categories/' + id)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getCateList()
        }
    }
}
</script>

<style lang="less" scoped>
.tree-table{
    margin-top: 20px;
    i{
        font-size: 14px;
    }
}
.el-cascader{
    width: 100%;
}
</style>
