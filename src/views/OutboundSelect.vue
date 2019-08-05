<template>
    <div class="outbound-select">
        <div class="wrapper">
            <div class="left mr-15">
                <BaseTabs
                    v-model="currentTab"
                    @on-click="tabChange"
                >
                    <div class="search_wrapper mt-10 mlr-10">
                        <Input
                            search
                            placeholder="请输入应用名称/应用ID"
                            style="width:260px;"
                            v-model="searchKey"
                            enter-button
                            @on-search="queryListFirst"
                        />
                        <div
                            v-show="currentTab === 0"
                            class="plat_type"
                        >
                            <label class="mr-10">平台类型</label>
                            <Select
                                v-model="categoryId"
                                style="width:150px"
                                @on-change="changeType"
                            >
                                <Option
                                    value=""
                                    :key="-1"
                                >请选择... </Option>
                                <Option
                                    v-for="item in appTypeList"
                                    :value="item.categoryId"
                                    :key="item.categoryId"
                                >{{ item.categoryName }}</Option>
                            </Select>
                        </div>
                    </div>
                    <BasePane label="私有云应用">
                        <div class="ps-10">
                            <Table
                                ref="private"
                                :loading="listLoading"
                                :columns="appColumns"
                                :data="appList"
                                max-height="340"
                                @on-select="selectOne"
                                @on-select-cancel="selectOneCancel"
                                @on-select-all="selectAll"
                                @on-select-all-cancel="selectAllCancel"
                            ></Table>
                            <Row>
                                <Page
                                    class="mt-15"
                                    :total="totalSize"
                                    :current="queryListParams.pageNumber"
                                    size="small"
                                    show-elevator
                                    @on-change="pageNumChange"
                                    @on-page-size-change="pageSizeChange"
                                />
                            </Row>
                        </div>
                    </BasePane>
                    <BasePane label="公有云应用">
                        <div class="ps-10">
                            <Table
                                ref="public"
                                :loading="listLoading"
                                :columns="appColumns"
                                :data="appList"
                                max-height="340"
                                @on-select="selectOne"
                                @on-select-cancel="selectOneCancel"
                                @on-select-all="selectAll"
                                @on-select-all-cancel="selectAllCancel"
                            ></Table>
                            <Row>
                                <Page
                                    class="mt-15"
                                    :total="totalSize"
                                    :current="queryListParams.pageNumber"
                                    size="small"
                                    show-elevator
                                    @on-change="pageNumChange"
                                    @on-page-size-change="pageSizeChange"
                                />
                            </Row>
                        </div>
                    </BasePane>
                </BaseTabs>
            </div>
            <div class="right">
                <p class="title ptb-5 plr-10">已选应用 {{ concatApplist.length }}</p>
                <ul class="content">
                    <li
                        v-for="(item, index) in concatApplist"
                        :key="index"
                    >
                        <p class="head">{{ item.appName }}</p>
                        <p class="info-icon cursor">
                            <template v-if="item.private">
                                <PrivateToolTip
                                    :data="item"
                                    select
                                />
                            </template>
                            <template v-else>
                                <PublicToolTip
                                    :data="item"
                                    select
                                />
                            </template>
                        </p>
                        <p
                            class="version"
                            :style="{ visibility: item.purchaseVersion ? 'visible' : 'hidden' }"
                        >
                            {{ item.purchaseVersion }}
                        </p>
                        <p
                            class="close cursor"
                            @click="cancelFromConcat(item.appId,item.private)"
                        >
                            <Icon
                                size="18"
                                color="#CDCED4"
                                type="md-close"
                            />
                        </p>
                    </li>
                </ul>
            </div>
        </div>
        <slot v-bind:hasPushList="hasPushList"></slot>
    </div>
</template>
<script>
import { readPrivateAppForPush, readPublicAppForPush, pushSchoolApp } from "@api/service";
import PrivateToolTip from "@components/PrivateToolTip";
import PublicToolTip from "@components/PublicToolTip";
import BaseSelect from "@components/BaseSelect";
import { mapState, mapActions } from "vuex";
export default {
    components: { PrivateToolTip, PublicToolTip, BaseSelect },
    name: "OutboundSelect",
    props: {
        loading: Boolean
    },
    data () {
        return {
            currentTab: 0,
            listLoading: false,
            totalSize: 0,
            appList: [],
            publicAppList: [],
            privateAppList: [],
            allList: [],
            searchKey: "",
            categoryId: "",
            isPrivate: true
        };
    },
    watch: {
        schoolCode (code) {
            if (code) this.queryListFirst();
        }
    },
    computed: {
        ...mapState(["appTypeList", "schoolCode"]),
        baseParams () {
            return {
                searchKey: this.searchKey,
                schoolCode: this.schoolCode,
                pageNumber: 1,
                pageSize: 10
            };
        },
        concatApplist () {
            return this.publicAppList.concat(this.privateAppList);
        },
        hasPushList () {
            //已经出库的列表
            return this.concatApplist.filter(it => it.hasPurchased === 1);
        },
        privateNoPushApplist () {
            //私有云未出库的列表
            return this.privateAppList.filter(it => it.hasPurchased === 0);
        },
        publicNoPushApplist () {
            //公有云未出库的列表
            return this.publicAppList.filter(it => it.hasPurchased === 0);
        },
        hasPushNum () {
            //出库的数量
            return (
                this.concatApplist.length -
                (this.privateNoPushApplist.length + this.publicNoPushApplist.length)
            );
        },
        queryListParams () {
            const map = new Map([
                [
                    0,
                    {
                        categoryId: this.categoryId,
                        ...this.baseParams
                    }
                ],
                [1, this.baseParams]
            ]);

            return map.get(this.currentTab);
        },
        parseApplist: {
            get () {
                return this.appList;
            },
            set (data) {
                let newData = [];
                //初始化处理数据结构
                if (this.currentTab === 0) {
                    newData = data.map(
                        ({
                            appId,
                            appName,
                            isWebApp,
                            hasPurchased,
                            isMobileApp,
                            versions,
                            categoryId
                        }) => {
                            return {
                                appId,
                                appName,
                                versions,
                                categoryId,
                                hasPurchased,
                                isWebApp,
                                isMobileApp,
                                private: true,
                                isPurchaseWeb: isWebApp,
                                isPurchaseMobile: isMobileApp,
                                purchaseVersion: versions ? versions[0] : "",
                                _checked: false
                            };
                        }
                    );
                } else if (this.currentTab === 1) {
                    newData = data.map(({ appId, appName, hasPurchased, serviceList }) => {
                        return {
                            appId,
                            appName,
                            serviceList,
                            hasPurchased,
                            private: false,
                            serviceIdList: serviceList
                                .filter(item => item.hasPurchased === 1)
                                .map(it => it.serviceId),
                            _checked: false
                        };
                    });
                }
                //如果已选就替换掉接口返回的数据

                for (let has of this.concatApplist) {
                    const index = newData.findIndex(it => it.appId === has.appId);
                    if (index !== -1) {
                        newData.splice(index, 1, has);
                    }
                }
                this.appList = newData;
            }
        },
        currentList () {
            const map = new Map([[0, this.privateAppList], [1, this.publicAppList]]);
            return map.get(this.currentTab);
        },
        trueList () {
            const map = new Map([[true, this.privateAppList], [false, this.publicAppList]]);
            return map.get(this.isPrivate);
        },
        appColumns () {
            if (this.currentTab == 0) {
                return [
                    {
                        type: "selection",
                        width: 60,
                        align: "center"
                    },
                    {
                        title: "应用名称",
                        width: 120,
                        render: (h, params) => {
                            const scopedSlots = {
                                default: props => <header>{props.appName}</header>
                            };
                            return <PrivateToolTip data={params.row} scopedSlots={scopedSlots} />;
                        }
                    },
                    {
                        title: "应用ID",
                        key: "appId"
                    },
                    {
                        title: "终端类型",
                        width: 145,
                        render: (h, param) => {
                            const { isPurchaseWeb, isWebApp, isPurchaseMobile, isMobileApp, appId } = param.row;

                            return (
                                <div class="terminal">

                                    <div
                                        onClick={() => {
                                            if (!isWebApp) return;
                                            if (isPurchaseWeb && !isPurchaseMobile) {
                                                this.warning('终端类型至少选择一种');
                                                return;
                                            }
                                            this.appList[
                                                param.index
                                            ].isPurchaseWeb = param.row.isPurchaseWeb = isPurchaseWeb
                                                ? 0
                                                : 1;
                                            this.changeWeb(appId, param.row.isPurchaseWeb);
                                        }}
                                        class={isWebApp ? isPurchaseWeb ? "active" : "" : 'disabled'}
                                    >
                                        PC
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (!isMobileApp) return;
                                            if (!isPurchaseWeb && isPurchaseMobile) {
                                                this.warning('终端类型至少选择一种');
                                                return;
                                            }
                                            this.appList[
                                                param.index
                                            ].isPurchaseMobile = param.row.isPurchaseMobile = isPurchaseMobile
                                                ? 0
                                                : 1;
                                            this.changeMobile(appId, param.row.isPurchaseMobile);
                                        }}
                                        class={isMobileApp ? isPurchaseMobile ? "active" : "" : 'disabled'}
                                    >
                                        移动端
                                    </div>
                                </div>
                            );
                        }
                    },

                    {
                        title: "版本号",
                        key: "versions",
                        width: 150,
                        render: (h, param) => {
                            let row = param.row;
                            return (
                                <Select
                                    transfer
                                    vModel={param.row.purchaseVersion}
                                    onOn-change={val => {
                                        this.appList[param.index].purchaseVersion = val;
                                        this.changeVersion(param.row.appId, val);
                                    }}
                                >
                                    {row.versions &&
                                        row.versions.map((item, index) => {
                                            return (
                                                <Option value={item} key={index}>
                                                    {item}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            );
                        }
                    }
                ];
            } else {
                return [
                    {
                        type: "selection",
                        width: 60,
                        align: "center"
                    },
                    {
                        title: "应用名称",
                        width: 140,
                        render: (h, params) => {
                            const scopedSlots = {
                                default: props => <header>{props.appName}</header>
                            };
                            return <PublicToolTip data={params.row} scopedSlots={scopedSlots} />;
                        }
                    },
                    {
                        title: "应用ID",
                        key: "appId"
                    },
                    {
                        title: "接入服务",
                        key: "serviceList",
                        ellipsis: true,
                        width: 220,
                        render: (h, params) => {
                            const { serviceList } = params.row;
                            const list = serviceList || [];
                            return (
                                <BaseSelect
                                    vModel={params.row.serviceIdList}
                                    onOn-change={value => {
                                        this.appList[params.index].serviceIdList = value;
                                        this.changeServiceIdList(params.row.appId, value);
                                    }}
                                    list={list}
                                />
                            );
                        }
                    }
                ];
            }
        },
        currentTableRefs () {
            const ref = new Map([[0, this.$refs.private], [1, this.$refs.public]]);
            return ref.get(this.currentTab);
        },
        checkAppApiParams () {
            return {
                privateApps: this.privateNoPushApplist.map(it => {
                    return { appId: it.appId, version: it.purchaseVersion };
                })
            };
        },
        pushSchoolAppParams () {
            const privateAppList = this.privateNoPushApplist.map(
                ({
                    appId,
                    appName,
                    isPurchaseWeb,
                    isPurchaseMobile,
                    purchaseVersion,
                    categoryId
                }) => {
                    return {
                        appId,
                        appName,
                        isPurchaseWeb,
                        isPurchaseMobile,
                        purchaseVersion,
                        categoryId
                    };
                }
            );

            const publicAppList = this.publicNoPushApplist.map(
                ({ appId, appName, serviceList, serviceIdList }) => {
                    return {
                        appId,
                        appName,
                        serviceList: serviceList.filter(it => serviceIdList.includes(it.serviceId))
                    };
                }
            );
            return {
                schoolCode: this.schoolCode,
                privateAppList,
                publicAppList
            };
        }
    },
    methods: {
        ...mapActions(["CHECK_PRIVATE_API"]),
        async checkAppApi () {
            if (this.privateNoPushApplist.length || this.publicNoPushApplist.length) {
                //校验公有云应用是否包含服务
                if (!this.checkService()) {
                    this.$store.commit("changeTipStatus", 1);
                    return;
                }
                this.$emit("update:loading", true);
                //如果有私有云未出库列表需要先验证
                if (this.privateNoPushApplist.length) {
                    this.$store.commit("changeTipStatus", 2);
                    const [err, data] = await this.CHECK_PRIVATE_API(this.checkAppApiParams);
                    if (err) {
                        this.$emit("update:loading", false);
                        this.$store.commit("changeTipStatus", 1);
                        return;
                    }
                    // 校验通过
                    if (data.checkFlag === 1) {
                        await this.pushSchoolApp(this.pushSchoolAppParams);
                        this.$store.commit("changeTipStatus", 1);
                        return;
                    }
                    //校验不通过
                    this.$emit("update:loading", false);

                } else {
                    await this.pushSchoolApp(this.pushSchoolAppParams);
                    this.$store.commit("changeTipStatus", 1);
                }
            } else {
                this.warning("无可出库的应用");
                this.$store.commit("changeTipStatus", 1);
            }
        },
        clearSelect () {
            this.publicAppList = [];
            this.privateAppList = [];
            this.searchKey = "";
            this.categoryId = "";
            this.currentTab = 0;
            this.queryListFirst();
        },
        async pushSchoolApp () {
            const [err, data] = await pushSchoolApp(this.pushSchoolAppParams);
            this.$emit("update:loading", false);
            if (err) {
                const msg = err || "出库失败";
                this.errors(msg);
                return;
            }
            this.success(`成功推送${data.count}个应用`);
            this.$emit('refresh')
            this.clearSelect();

        },
        checkService () {
            //校验共用云应用是否有服务
            let passed = true;
            for (let it of this.publicNoPushApplist) {
                if (it.serviceIdList.length == 0) {
                    const { appName } = it;
                    passed = false;
                    this.warning(`要出库的公有云应用<font color="#ed4014">${appName}</font>至少要选择一个出库服务`)
                    break;
                }
            }
            return passed;
        },
        selectOne (selection, row) {
            this.changeChecked(true, row);
            row._checked = true;
            this.pushSelect(row);
        },
        selectOneCancel (selection, row) {
            this.changeChecked(false, row);
            row._checked = false;
            this.cancelSelect(row);
        },
        selectAll (selection) {
            this.changeAllChecked(true);
            this.pushAllSelect(selection);
        },
        selectAllCancel () {
            this.changeAllChecked(false);
            this.cancelAllSelect();
        },
        pushSelect (row) {
            this.currentList.push(row);
        },
        cancelSelect ({ appId }) {
            const index = this.findCurrentIDIndex(appId);
            index !== -1 && this.currentList.splice(index, 1);
        },
        pushAllSelect (selection) {
            for (let from of selection) {
                if (this.findCurrentIDIndex(from.appId) > -1) {
                    continue;
                }
                from._checked = true;
                this.currentList.push(from);
            }
        },
        cancelAllSelect () {
            for (let from of this.appList) {
                let index = this.findCurrentIDIndex(from.appId);
                index !== -1 && this.currentList.splice(index, 1);
            }
        },
        //更改单个选中状态
        changeChecked (check, { appId }) {
            this.appList.map(it => {
                if (it.appId === appId) {
                    it._checked = check;
                }
            });
        },
        //根据id修改终端类型
        changeWeb (appId, state) {
            let index = this.findCurrentIDIndex(appId);
            index !== -1 && (this.currentList[index].isPurchaseWeb = state);
        },
        changeMobile (appId, state) {
            let index = this.findCurrentIDIndex(appId);
            index !== -1 && (this.currentList[index].isPurchaseMobile = state);
        },
        changeVersion (appId, state) {
            let index = this.findCurrentIDIndex(appId);
            index !== -1 && (this.currentList[index].purchaseVersion = state);
        },
        changeServiceIdList (appId, state) {
            let index = this.findCurrentIDIndex(appId);
            index !== -1 && (this.currentList[index].serviceIdList = state);
        },
        changeAllChecked (check) {
            this.appList.map(it => (it._checked = check));
        },

        //从已选中删除选中
        cancelFromConcat (appId, isPrivate) {
            this.isPrivate = isPrivate;
            const index = this.findTrueIDIndex(appId);
            this.trueList.splice(index, 1);

            this.changeChecked(false, appId);

            //去除表格中的勾选状态
            const obj = this.currentTableRefs.$data.objData;
            Object.keys(obj).forEach(key => {
                if (obj[key] && obj[key].appId === appId) {
                    obj[key]._isChecked = false;
                }
            });
        },
        //根据id从已选列表中找到数据索引
        findCurrentIDIndex (appId) {
            return this.currentList.findIndex(it => it.appId === appId);
        },
        findTrueIDIndex (appId) {
            return this.trueList.findIndex(it => it.appId === appId);
        },
        tabChange () {
            this.queryListFirst();
        },
        changeType () {
            this.queryListFirst();
        },
        async queryList () {
            this.listLoading = true;

            const queryFn = this.currentTab === 0 ? readPrivateAppForPush : readPublicAppForPush;
            const [err, data] = await queryFn(this.queryListParams);
            this.listLoading = false;
            if (err) {
                const msg = err || "获取列表错误";
                this.errors(msg);
                return;
            }
            this.totalSize = data.totalSize;
            this.parseApplist = data.rows;
        },
        queryListFirst () {
            this.queryListParams.pageNumber = 1;
            this.queryList();
        },
        pageNumChange (num) {
            this.queryListParams.pageNumber = num;
            this.queryList();
        },
        pageSizeChange (num) {
            this.queryListParams.pageSize = num;
            this.queryList();
        }
    },
    mounted () {
        // this.queryList();
    }
};
</script>
<style lang="stylus">
.service-checkbox-wrapper {
    .ivu-checkbox-wrapper {
        display: block;
    }
}
</style>

<style lang="stylus" scoped>
>>>.terminal {
    display: flex;
    justify-content: space-between;
    div {
        width: 50px;
        border-radius: 4px;
        padding: 1px 0;
        text-align: center;
        cursor: pointer;
        user-select: none;
        transition: 0.3s;
    }
    div.active {
        background: $primary-color;
        color: #fff;
    }
    .disabled {
        cursor: no-drop;
        color: #c5c8ce;
    }
}
.outbound-select {
    .search_wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .wrapper {
        display: flex;
        justify-content: space-between;
        height: 485px;
        .left {
            width: 600px;
            display: flex;
        }
        .right {
            display: flex;
            flex-direction: column;
            border: 1px solid $grey-v1;
            border-radius: 4px;
            flex: 1;
            .title {
                font-size: 16px;
                height: 41px;
                line-height: 31px;
                background: #F5F7FA;
            }
            .content {
                flex-grow: 1;
                margin: 8px;
                overflow-y: auto;
                li {
                    display: flex;
                    height: 32px;
                    border-bottom: 1px solid $grey-v1;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px;
                    font-size: 13px;
                    .head {
                        width: 100px;
                        ellipsis();
                    }
                    .version {
                        width: 100px;
                        color: #CDCED4;
                        ellipsis();
                    }
                }
            }
        }
    }
    .plat_type {
        fon-size: 14px;
        display: flex;
        align-items: center;
    }
}
</style>
