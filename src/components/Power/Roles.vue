<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="success" @click="addRolse">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['row-bottom',index === 0 ? 'row-top' :'']"
              v-for="(item1,index) in scope.row.children"
              :key="item1.id"
              :index="index.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="closeItemTag(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限和三级权限-->
              <el-col :span="19">
                <el-row
                  :class="[index ===0 ? '' : 'row-top' ]"
                  v-for="(item2,index) in item1.children "
                  :key="index.id"
                  :index="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="closeItemTag(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      closable
                      @close="closeItemTag(scope.row,item3.id)"
                      type="warning"
                      v-for="(item3,index) in item2.children"
                      :key="index.id"
                      :index="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editDialog(scope.row.id)"
            >修改</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeDialog(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="isShowDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="dialogVisibleRightsList"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 分配树型结构   show-checkbox 节点是否可被选择  node-key="id"每个树节点用来作为唯一标识的属性，整棵树应该是唯一的  
      default-expand-all  是否默认展开所有节点 default-checked-keys 	默认勾选的节点的 key 的数组-->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultArr"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRightsList = false">取 消</el-button>
        <el-button type="primary" @click="allRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="AddRolesDialogVisible" width="50%" @close="addClosed">
      <el-form
        :model="addRolesRuleForm"
        :rules="addRolesRuleFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialogVisible" width="50%">
      <el-form
        :model="editRolesRuleForm"
        :rules="editRolesRuleFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [], //角色列表,
      dialogVisibleRightsList: false, //默认不显示权限列表对话框
      rightsList: [], //权限列表
      //树型控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      //默认勾选节点的数组
      defaultArr: [],
      //获取权限的id值
      roleId: "",
      //默认不显示添加角色对话框
      AddRolesDialogVisible: false,
      //表单数据
      addRolesRuleForm: {
        roleName: "",
        roleDesc: ""
      },
      //表单规则
      addRolesRuleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      //是否显示编辑对话框
      editRolesDialogVisible: false,
      //修改表单数据
      editRolesRuleForm: {},
      //修改表单规则
      editRolesRuleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data } = await this.$http.get("roles");
      if (data.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList = data.data;
      console.log(this.rolesList);
    },
    async closeItemTag(role, right) {
      //根据id删除对应的权限
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      // console.log('确定删除')
      const { data } = await this.$http.delete(
        `roles/${role.id}/rights/${right}`
      );
      if (data.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      role.children = data.data;
      console.log(role);
    },
    //是否显示Diolog弹框
    async isShowDialog(role) {
      //拿到权限id值
      this.roleId = role.id;

      //；列表显示之前 先获取权限列表
      const { data } = await this.$http.get("rights/tree");
      if (data.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightsList = data.data;
      console.log(this.rightsList);
      //递归获取三级节点的id
      this.getDefaultArr(role, this.defaultArr);
      //显示权限对话框
      this.dialogVisibleRightsList = true;
    },
    //通过递归的形式 获取角色下所有的三级权限id，保存到defaultArr数组中
    getDefaultArr(node, arr) {
      //判断是否为三级节点 没有children节点则说明是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getDefaultArr(item, arr);
      });
    },
    //监听分配权限对话框的关闭事件 关闭上一次事件 防止有多余的默认权限
    setRightDialogClosed() {
      this.defaultArr = [];
    },
    //分配权限给用户
    async allRights() {
      //得到分配权限框中的 全选和半选的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      //以逗号的形式拼接
      const idStr = keys.join(",");
      //发送分配权限请求
      //在这之前拿不到roleId 所以在弹出权限框的时候就拿到id值
      const { data } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      });
      if (data.meta.status !== 200) {
        return this.$message.error("获取分权限失败");
      }
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.dialogVisibleRightsList = false;
    },
    //添加角色按钮 是否显示添加对话框
    addRolse() {
      this.AddRolesDialogVisible = true;
    },
    //添加角色
    async add() {
      const { data } = await this.$http.post("roles", this.addRolesRuleForm);
      if (data.meta.status !== 201) {
        return this.$message.error("添加用户失败");
      }
      this.$message.success("添加用户成功");
      this.getRolesList();
      this.AddRolesDialogVisible = false;
    },
    //点击编辑按钮是否显示编辑对话框
    async editDialog(id) {
      //获取角色信息
      const { data } = await this.$http.get("roles/" + id);
      if (data.meta.status !== 200) {
        return this.$message.error("查询用户id失败");
      }
      this.editRolesRuleForm = data.data;
      console.log(data.data);
      this.editRolesDialogVisible = true;
    },
    //重置表单数据
    addClosed() {
      this.$refs.ruleFormRef.resetFields();
    },
    //编辑对话框
    edit() {
      //表单校验
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //发送修改命令请求
        const { data } = await this.$http.put(
          "roles/" + this.editRolesRuleForm.roleId,
          {
            roleName: this.editRolesRuleForm.roleName,
            roleDesc: this.editRolesRuleForm.roleDesc
          }
        );
        if (data.meta.status !== 200) {
          return this.$message.error("编辑失败");
        }
        this.$message.success("编辑用户成功");
        this.getRolesList();
        this.editRolesDialogVisible = false;
      });
    },
    //点击删除用户列表
    async removeDialog(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("点击了取消");
      }
      //发送删除请求
      const { data } = await this.$http.delete("roles/" + id);
      if (data.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getRolesList();
    }
  },

  components: {}
};
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '../../common/stylus/mixins.styl';

.el-card {
  margin-top: 15px;
}

.el-row {
  margin: 7px;
}

.row-bottom {
  border-bottom: 1px solid #eee;
}

.row-top {
  border-top: 1px solid #eee;
}

.el-tag {
  margin-right: 15px;
  margin-top: 10px;
}
</style>
