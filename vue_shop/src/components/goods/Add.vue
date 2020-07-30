<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条区域 -->
            <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
            </el-steps>
            <!-- 表单标签区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
            label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="tabPosition" style="height: 200px;" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input type="number" v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input type="number" v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input type="number" v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                            v-model="addForm.goods_cat"
                            :options="catelist"
                            :props="{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', children: 'children' }"
                            @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox border :label="cd" v-for="(cd, i) in item.attr_vals" :key="i"></el-checkbox>
                        </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                        action="http://127.0.0.1:8888/api/private/v1/upload"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj"
                        :on-success="handSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor :v-model="addForm.goods_introduce" />
                        <el-button  class="btnAdd" type="primary" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            activeIndex: '0',
            tabPosition: 'left',
            catelist: [],
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            addFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' }
                ]
            },
            // 动态参数列表啊数组
            manyTableData: [],
            onlyTableData: [],
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewPath: '',
            previewVisible: false
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取分类列表
        async getCateList() {
            const { data: res } = await this.$axios.get('categories')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.catelist = res.data
        },
        handleChange() {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
        },
        beforeTabLeave(activeName, oldActiveName) {
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('清先选择商品分类！')
                return false
            }
        },
        async tabClicked() {
            if (this.activeIndex === '1') {
                const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                })
                this.manyTableData = res.data
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.onlyTableData = res.data
            }
        },
        // 图片预览
        handlePreview(file) {
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        // 图片移除
        handleRemove(file) {
            const filePath = file.response.data.tmp_path
            const i = this.addForm.pics.findIndex(x => x.pic === filePath)
            this.addForm.pics.splice(i, 1)
        },
        // 图片上传成功
        handSuccess(response) {
            const picInfo = { pic: response.data.tmp_path }
            this.addForm.pics.push(picInfo)
        },
        add() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写必要的表单项目')
                }
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = this.addForm.goods_cat.join(',')
                // 处理动态参数和静态属性
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                        }
                    this.addForm.attrs.push(newInfo)
                })
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                        }
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs
                // 发起添加商品请求，商品名称必须唯一
                const { data: res } = await this.$axios.post('goods', form)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success(res.meta.msg)
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
.el-tabs{
    height: 100% !important;
}
.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.el-dialog{
    img{
        width: 100%;
        height: 100%;
    }
}
.btnAdd{
    margin-top: 15px;
}
</style>
