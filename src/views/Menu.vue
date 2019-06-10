<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="菜单名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getMenus">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>


        <!--数据表格-->
        <el-table
                :data="menus"
                style="width: 100%"
                row-key="id"
                border
                highlight-current-row
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
                    prop="name"
                    label="菜单名称"
                    width="180">
            </el-table-column>
            <el-table-column
                        prop="sn"
                        label="菜单标识">
            </el-table-column>
            <el-table-column
                        prop="icon"
                        label="菜单图标"
                        width="180">
            </el-table-column>
            <el-table-column
                        prop="path"
                        label="菜单路径"
                        width="180">
            </el-table-column>
            <el-table-column
                        prop="component"
                        label="组件">
            </el-table-column>
            <el-table-column
                        prop="intro"
                        label="菜单简介"
                        width="180">
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24">
            <el-pagination layout="prev, pager, next" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--添加修改模态框-->
        <el-dialog
                :title="dialogTitle"
                :visible.sync="dialogVisible"
                width="40%">

            <el-form ref="form" :model="menu" label-width="80px" :rules="rules">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="menu.name"></el-input>
                </el-form-item>
                <el-form-item label="标识" prop="sn">
                    <el-input v-model="menu.sn"></el-input>
                </el-form-item>
                <el-form-item label="上级菜单">
                    <el-select clearable v-model="menu.parentId" placeholder="请选择" style="width:100%">
                        <el-option
                                v-for="item in parentMenus"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                            <span style="float: left">{{ item.name }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sn }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="图标">
                    <el-popover
                            placement="right-start"
                            width="300"
                            trigger="click"
                            @show="$refs.icons.reset()"
                            popper-class="popper-class">
                        <icons ref="icons" @selected="selectedIcon" />
                        <el-input slot="reference" placeholder="请选择图标" readonly v-model="menu.icon" style="cursor: pointer;">
                            <template slot="prepend"><i :class="menu.icon"></i></template>
                        </el-input>
                    </el-popover>
                </el-form-item>
                <el-form-item label="路径">
                    <el-input v-model="menu.path"></el-input>
                </el-form-item>
                <el-form-item label="组件名称">
                    <el-input v-model="menu.component"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="menu.intro"></el-input>
                </el-form-item>
            </el-form>


            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleSave">确 定</el-button>
            </span>
        </el-dialog>

    </section>
</template>

<script>
    import Icons from '../components/Icons'

    export default {
        name: "Menu.vue",
        components:{
            Icons
        },
        data(){
            let validateSn = (rule, value, callback)=>{
                this.$http.get("/menu/validateSn",{
                    params:{
                        sn:value
                    }
                }).then(res=>{
                    let data = res.data;
                    if(!data){
                        callback(new Error('菜单标识已存在！'));
                    }else{
                        callback();
                    }
                })
            }
            return {
                rules:{
                    name: [
                        { required: true, message: '请菜单名称', trigger: 'blur' },
                    ],
                    sn: [
                        { required: true, message: '请输入菜单标识', trigger: 'blur' },
                        { validator: validateSn, trigger: 'blur' }
                    ]
                },
                menu:{
                    id: null,
                    name:'',
                    sn:'',
                    parentId:'',
                    icon:'',
                    path:'',
                    component:'',
                    intro:''

                },
                dialogVisible:false,
                dialogTitle:'',
                //分页
                page:1,
                size:10,
                total:0,
                //关键字查询
                filters:{
                    keyword:''
                },
                menus:[],
                parentMenus:[]
            }
        },
        methods:{
            handleDel(index,row){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.get("/menu/delete",{
                        params:{
                            id:row.id
                        }
                    }).then(res=>{
                        let data = res.data;
                        if(data.success){
                            this.$message({
                                message: data.message,
                                type: 'success'
                            });
                            this.loadMenus();
                        }else{
                            this.$message({
                                message: data.message,
                                type: 'error'
                            });
                        }
                    })
                }).catch(() => {

                });
            },
            //保存菜单
            handleSave(){
                let param = Object.assign(this.menu);

                //发送请求
                this.$http.post("/menu/save",param).then(res=>{
                    let data = res.data;
                    if(data.success){
                        //成功
                        this.$message({
                            message: data.message,
                            type: 'success'
                        });
                        this.menu = {
                            id: null,
                            name:'',
                            sn:'',
                            parentId:'',
                            icon:'',
                            path:'',
                            component:'',
                            intro:''
                        }
                        this.dialogVisible = false;
                        this.loadMenus();
                    }else{
                        //失败
                        this.$message({
                            message: data.message,
                            type: 'error'
                        });
                    }
                })
            },
            getMenus(){

            },
            handleAdd(){
                this.menu = {
                    id: null,
                    name:'',
                    sn:'',
                    parentId:'',
                    icon:'',
                    path:'',
                    component:'',
                    intro:''
                }
                this.dialogTitle = "添加"
                this.dialogVisible = true
                this.loadParentMenus()
            },
            loadMenus(){
                let param = {
                    page : this.page,
                    rows : this.size
                }
                this.$http.post("/menu/query",param).then(res=>{
                    let data = res.data;
                    this.total = data.total;
                    this.menus = data.rows;
                })
            },
            loadParentMenus(){
                this.$http.get("/menu/getParentMenus").then(res=>{
                    this.parentMenus = res.data;
                })
            },
            selectedIcon (name) {
                this.menu.icon = name;
                document.body.click()
            }
        },
        mounted(){
            this.loadMenus();
        }
    }
</script>

<style scoped>

</style>
