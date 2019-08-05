<template>
  <div class="app-push">
    <NavBar :model="routes">
      <li>学校应用详情（{{ schoolName }}）</li>
    </NavBar>
    <Tabs v-model="currentTab" @on-click="tabChange">
      <TabPane label="私有云应用"></TabPane>
      <TabPane label="公有云应用"></TabPane>
    </Tabs>
    <div>
      <Input
        search
        placeholder="请输入应用名称/应用ID"
        style="width:458px;"
        v-model="searchKey"
        enter-button
        @on-search="queryListFirst"
      />
      <div class="plat_type mt-10" v-show="currentTab === 0">
        <label class="mr-10">应用分类</label>
        <Select
          v-model="queryListParams.categoryId"
          style="width:400px;"
          @on-change="changeType"
          transfor
        >
          <Option value :key="-1">请选择...</Option>
          <Option
            v-for="(option, index) in appTypeList"
            :value="option.categoryId"
            :key="index"
          >{{ option.categoryName }}</Option>
        </Select>
      </div>
      <div class="table mt-10 mb-15">
        <Table :loading="listLoading" stripe border :columns="schoolColumns" :data="appList"></Table>
        <Row>
          <Page
            class="mt-15"
            :total="totalSize"
            :current="queryListParams.pageNumber"
            show-elevator
            @on-change="pageNumChange"
            @on-page-size-change="pageSizeChange"
          />
        </Row>
      </div>
    </div>
  </div>
</template>
<script>
import { queryPrivateApp, queryPublicApp } from "@api/service";
import { mapState } from "vuex";
export default {
  meta: { name: "应用出库" },
  components: {},
  name: "AppPush",
  props: {},
  data() {
    return {
      routes: [],
      currentTab: 0,
      totalSize: 0,
      appSelectList: [],
      listLoading: false,
      appList: [],
      searchKey: "",
      purchaseStatus: 2,
      isPurchaseWeb: "",
      isPurchaseMobile: ""
    };
  },
  watch: {
    schoolCode(code) {
      if (code) this.queryListFirst();
    }
  },
  computed: {
    ...mapState(["appTypeList", "schoolCode"]),

    schoolName() {
      return this.$route.params.schoolName;
    },
    baseParams() {
      return {
        schoolCode: this.schoolCode,
        searchKey: this.searchKey,
        pageNumber: 1,
        pageSize: 10
      };
    },
    queryListParams() {
      const map = new Map([
        [
          0,
          {
            categoryId: "",
            isPurchaseWeb: this.isPurchaseWeb,
            isPurchaseMobile: this.isPurchaseMobile,
            purchaseStatus: this.purchaseStatus,
            ...this.baseParams
          }
        ],
        [1, this.baseParams]
      ]);

      return map.get(this.currentTab);
    },
    schoolColumns() {
      if (this.currentTab == 0) {
        return [
          {
            title: "应用名称",
            key: "appName"
          },
          {
            title: "应用ID",
            key: "appId"
          },
          {
            title: "应用分类",
            key: "categoryName"
          },
          {
            title: "终端类型",
            filters: [
              {
                label: "PC",
                value: 1
              },
              {
                label: "移动",
                value: 2
              }
            ],
            // filterMultiple: false,
            filterRemote: value => {
              if (value.length === 1) {
                if (value.includes(1)) {
                  this.isPurchaseWeb = 1;
                  this.isPurchaseMobile = 0;
                }
                if (value.includes(2)) {
                  this.isPurchaseMobile = 1;
                  this.isPurchaseWeb = 0;
                }
              }
              if (value.length === 2) {
                this.isPurchaseWeb = 1;
                this.isPurchaseMobile = 1;
              }
              if (value.length === 0) {
                this.isPurchaseWeb = "";
                this.isPurchaseMobile = "";
              }

              this.queryListFirst();
            },
            render: (h, param) => {
              const { isPurchaseWeb, isPurchaseMobile } = param.row;
              if (isPurchaseWeb) {
                return <span>PC</span>;
              } else if (isPurchaseMobile) {
                return <span>移动</span>;
              } else if (isPurchaseWeb && isPurchaseMobile) {
                return <span>PC 移动</span>;
              }
            }
          },
          {
            title: "接入时间",
            key: "purchaseTime"
          },
          {
            title: "版本号",
            key: "purchaseVersion"
          },
          {
            title: "接入状态",
            align: "center",
            filters: [
              {
                label: "已接入",
                value: 1
              },
              {
                label: "待接入",
                value: 0
              }
            ],
            filterMultiple: false,
            filterRemote: value => {
              let label = value[0];

              if (typeof label === "undefined") label = 2;

              this.purchaseStatus = label;

              this.queryListFirst();
            },
            render: (h, param) => {
              const { purchaseStatus } = param.row;

              if (purchaseStatus === 1) {
                return <span style="color:#2EBE6D">已接入</span>;
              }

              if (purchaseStatus === 0) {
                return <span style="color:#515A6E">待接入</span>;
              }
            }
          }
        ];
      } else {
        return [
          {
            title: "应用名称",
            key: "appName"
          },
          {
            title: "应用ID",
            key: "appId"
          },
          {
            title: "开发厂商",
            key: "venderName"
          },
          {
            title: "状态",
            align: "center",
            render: (h, param) => {
              const { purchaseStatus } = param.row;

              if (purchaseStatus === 1) {
                return <span style="color:#2EBE6D">已接入</span>;
              }

              if (purchaseStatus === 0) {
                return <span style="color:#515A6E">待接入</span>;
              }
            }
          },
          {
            title: "接入时间",
            key: "purchaseTime"
          },
          {
            title: "服务",
            key: "serviceList",
            ellipsis: true,
            width: 400,
            render: (h, params) => {
              const { serviceList } = params.row;
              const list = serviceList || [];
              function transforText(it) {
                const { isPurchaseWeb, isPurchaseMobile } = it;
                let text = "";
                if (isPurchaseWeb) {
                  text = "（PC）";
                } else if (isPurchaseMobile) {
                  text = "（移动）";
                } else if (isPurchaseWeb && isPurchaseMobile) {
                  text = "（PC/移动）";
                }
                return text;
              }
              const text = list
                .map(it => {
                  let text = transforText(it);
                  return `${it.serviceName}${text}`;
                })
                .join(",");
              const scopedSlots = {
                content: () => (
                  <div style="white-space: normal">
                    {list.map(it => {
                      let text = transforText(it);
                      return <Tag>{it.serviceName + text}</Tag>;
                    })}{" "}
                  </div>
                )
              };
              return (
                <Tooltip
                  transfer
                  theme="light"
                  placement="bottom-start"
                  scopedSlots={scopedSlots}
                >
                  {text}
                </Tooltip>
              );
            }
          }
        ];
      }
    }
  },
  methods: {
    changeType() {
      this.queryListFirst();
    },
    async queryList() {
      this.listLoading = true;

      const queryFn = this.currentTab === 0 ? queryPrivateApp : queryPublicApp;

      const [err, data] = await queryFn(this.queryListParams);
      this.listLoading = false;
      if (err) {
        const msg = err || "获取列表错误";
        this.errors(msg);
        return;
      }
      if (!data) return;
      this.totalSize = data.totalSize;
      this.appList = data.rows;
    },
    queryListFirst() {
      this.queryListParams.pageNumber = 1;
      this.queryList();
    },
    pageNumChange(num) {
      this.queryListParams.pageNumber = num;
      this.queryList();
    },
    pageSizeChange(num) {
      this.queryListParams.pageSize = num;
      this.queryList();
    },
    tabChange() {
      this.searchKey = "";
      this.queryListFirst();
    }
  },
  mounted() {
    this.queryList();
  },
  beforeRouteEnter(to, form, next) {
    console.log(form);
    next(vm => {
      vm.routes = [form];
    });
  }
};
</script>
<style lang="stylus" scoped>
>>>.ivu-tooltip {
  ellipsis()
  display: block
}
.app-push {
  .plat_type {
    fon-size: 14px
    display: flex
    align-items: center
  }
}
</style>
