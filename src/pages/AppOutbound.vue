<template>
    <div class="app-outbound">
        <NavBar :model="[$route]" />
        <div class="outbound_search mt-10">
            <Input
                search
                placeholder="请输入租户名称"
                style="width:458px;"
                enter-button
                v-model="queryListParams.searchKey"
                @on-search="queryListFirst"
            />
        </div>
        <div class="add mt-25">
            <Button
                type="primary"
                size="large"
                @click.native="showCreate"
            >&nbsp;&nbsp;&nbsp;新建&nbsp;&nbsp;&nbsp;</Button>
        </div>
        <div class="table mt-10 mb-15">
            <Table
                :loading="listLoading"
                stripe
                border
                :columns="schoolColumns"
                :data="schoolList"
            ></Table>
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

        <BaseModal
            v-model="showAddModal"
            title="新建"
            @on-cancel="cancelCreate"
            @on-ok="create"
            ok-text="新建"
        >
            <Form
                ref="formCreate"
                label-position="left"
                :label-width="80"
                :model="saveSchoolParams"
                :rules="formCreateValidate"
                class="plr-25"
                @submit.native.prevent="submit"
            >
                <FormItem
                    label="学校名称"
                    prop="schoolCode"
                >
                    <Select
                        v-model="saveSchoolParams.schoolCode"
                        filterable
                        remote
                        :remote-method="searchSchool"
                        :loading="searchLoading"
                        placeholder="请选择..."
                        transfer
                    >
                        <Option
                            v-for="(option, index) in schoolSelectList"
                            :value="option.schoolCode"
                            :key="index"
                        >{{ option.schoolName }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="学校代码">
                    <Input
                        readonly
                        v-model="saveSchoolParams.schoolCode"
                        placeholder="选择学校后显示"
                        :disabled="saveSchoolParams.schoolCode === ''"
                    ></Input>
                </FormItem>
                <FormItem
                    label="平台类型"
                    prop="schoolType"
                >
                    <RadioGroup v-model="saveSchoolParams.schoolType">
                        <Radio :label="1">
                            <span>新私有云平台</span>
                        </Radio>
                        <Radio :label="2">
                            <span>校端平台</span>
                        </Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </BaseModal>

        <BaseModal
            v-model="showTypeModal"
            title="修改平台类型"
            @on-cancel="cancelType"
            @on-ok="saveType"
            ok-text="保存"
        >
            <div class="plat_type">
                <label class="mr-10">平台类型</label>
                <RadioGroup v-model="schoolType">
                    <Radio :label="1">
                        <span>新私有云平台</span>
                    </Radio>
                    <Radio :label="2">
                        <span>校端云平台</span>
                    </Radio>
                </RadioGroup>
            </div>
        </BaseModal>

        <BaseModal
            v-model="outBoundModal"
            title="应用出库"
            width="963px"
            :closable="false"
            :mask-closable="false"
        >
            <OutboundSelect
                ref="select"
                :loading.sync="pushLoading"
                @refresh="queryListFirst"
            >
                <template #default="list">
                    <span style="display:none">
                        {{ (hasPushList = list.hasPushList) }}
                    </span>
                </template>
            </OutboundSelect>
            <template #footer>
                <Row>
                    <Button
                        @click.native="showConfirm"
                        class="mr-10"
                        type="text"
                    >取消</Button>
                    <template v-if="tipStatus === 1">
                        <OutboundButton
                            ref="checktip"
                            :model="hasPushList"
                            @on-click="checkPush"
                        >
                            <Button
                                @click.native="showCheckPush"
                                type="primary"
                                :loading="pushLoading"
                            >确认出库</Button>
                        </OutboundButton>
                    </template>

                    <template v-else>
                        <OutboundNotTip
                            ref="nochecktip"
                            @on-click="closeTip"
                        >
                            <Button
                                @click.native="closeTip"
                                type="primary"
                                :loading="pushLoading"
                            >确认出库</Button>
                        </OutboundNotTip>
                    </template>
                </Row>
            </template>
        </BaseModal>

        <BaseModal
            v-model="outConfirm"
            title="确认"
            ok-text="关闭"
            ok-type="error"
            type="warning"
            width="360"
            simple
            @on-ok="closeOutbound"
            @on-cancel="cancelOutConfirm"
        >
            <label>关闭后已选数据将被清除，确认操作吗？</label>
        </BaseModal>
    </div>
</template>
<script>
import { querySchool, initAllSchool, saveSchool } from "@api/service";
import OutboundSelect from "@views/OutboundSelect.vue";
import OutboundButton from "@views/OutboundButton.vue";
import OutboundNotTip from "@views/OutboundNotTip.vue";

import { mapState } from "vuex";

export default {
    meta: { name: "应用出库" },
    // mixins:[emitter],
    components: {
        OutboundSelect,
        OutboundButton,
        OutboundNotTip
    },
    name: "AppOutbound",
    props: {},
    data () {
        return {
            pushLoading: false,
            searchLoading: false,
            outConfirm: false,
            schoolList: [],
            schoolSelectList: [],
            listLoading: false,
            totalSize: 0,
            showAddModal: false,
            showTypeModal: false,
            outBoundModal: false,
            schoolType: 1,
            schoolCode: "",
            schoolName: "",
            saveSchoolParams: {
                schoolCode: "",
                schoolType: 1,
                schoolName: ""
            },
            hasPushList: []
        };
    },

    computed: {
        ...mapState(["appTypeList", "tipStatus"]),
        formCreateValidate () {
            return {
                schoolCode: { required: true, message: "请选择学校", trigger: "change" }
            };
        },
        queryListParams () {
            return {
                searchKey: "",
                schoolType: "",
                pageNumber: 1,
                pageSize: 10
            };
        },
        initAllSchoolParams () {
            return {
                params: { searchKey: "" }
            };
        },
        schoolColumns () {
            return [
                {
                    title: "学校名称",
                    key: "schoolName"
                },
                {
                    title: "学校代码",
                    key: "schoolCode"
                },
                {
                    title: "学校平台类型",
                    filters: [
                        {
                            label: "新私有云平台",
                            value: 1
                        },
                        {
                            label: "校端云平台",
                            value: 2
                        }
                    ],
                    filterMultiple: false,
                    filterRemote: value => {
                        this.queryListParams.schoolType = value[0];
                        this.queryList();
                        // return row.schoolType === value;
                    },
                    render: (h, param) => {
                        const { schoolType } = param.row;
                        return schoolType == 1 ? (
                            <span>新私有云平台</span>
                        ) : (
                                <span>校端云平台</span>
                            );
                    }
                },
                {
                    title: "平台开通时间",
                    key: "publishTime"
                },
                {
                    title: "已出库应用数",
                    key: "purchaseCount",
                    align: "right"
                },
                {
                    title: "操作",
                    key: "address",
                    align: "center",
                    render: (h, params) => {
                        return (
                            <div>
                                <span class="split" onClick={() => this.showOutbound(params.row)}>
                                    应用出库
                                </span>
                                <span class="split" onClick={() => this.toDetail(params.row)}>
                                    详情
                                </span>
                                <span class="split" onClick={() => this.showType(params.row)}>
                                    修改平台类型
                                </span>
                            </div>
                        );
                    }
                }
            ];
        }
    },
    watch: {
        "saveSchoolParams.schoolCode" (val) {
            if (val) {
                this.saveSchoolParams.schoolName = this.schoolSelectList.find(
                    it => it.schoolCode === val
                ).schoolName;
            } else {
                this.saveSchoolParams.schoolName = "";
            }
        }
    },
    methods: {
        submit () { },
        showConfirm () {
            this.$refs.select.concatApplist.length
                ? (this.outConfirm = true)
                : this.closeOutbound();
        },
        cancelOutConfirm () {
            this.outConfirm = false;
        },
        closeOutbound () {
            this.outBoundModal = false;
            this.outConfirm = false;
            this.$refs.select.clearSelect();
        },
        checkPush () {
            this.$refs.checktip.disabled = true;
            this.$refs.select.checkAppApi();
        },
        showCheckPush () {
            const hasOut = this.hasPushList.length > 0;
            if (hasOut) {
                this.$refs.checktip && (this.$refs.checktip.disabled = false);
            } else {
                this.$store.commit("changeTipStatus", 2);
                this.checkPush();
            }
        },
        closeTip () {
            this.$refs.nochecktip.disabled = true;
        },
        async queryList () {
            this.listLoading = true;
            const [err, data] = await querySchool(this.queryListParams);
            this.listLoading = false;
            if (err) {
                const msg = err || "获取学校列表错误";
                this.errors(msg);
                return;
            }
            this.totalSize = data.totalSize;
            this.schoolList = data.rows;
        },
        queryListFirst () {
            this.queryListParams.pageNumber = 1;
            this.queryList();
        },
        async initAllSchool () {
            this.searchLoading = true;
            const [err, data] = await initAllSchool(this.initAllSchoolParams);
            this.searchLoading = false;
            if (err) {
                const msg = err || "获取学校列表错误";
                this.errors(msg);
                return;
            }
            this.schoolSelectList = data;
        },
        async saveSchool () {
            const [err] = await saveSchool(this.saveSchoolParams);
            if (err) {
                const msg = err || "保存失败";
                this.errors(msg);
                return false;
            }
            this.success("保存成功");
            this.queryListFirst();
            return true;
        },
        searchSchool (val) {
            this.initAllSchoolParams.params.searchKey = val;
            this.initAllSchool();
        },
        pageNumChange (num) {
            this.queryListParams.pageNumber = num;
            this.queryList();
        },
        pageSizeChange (num) {
            this.queryListParams.pageSize = num;
            this.queryList();
        },
        showCreate () {
            this.showAddModal = true;
        },
        cancelCreate () {
            this.$refs.formCreate.resetFields();
            this.searchSchool('');
            this.showAddModal = false;
        },
        create () {
            this.$refs.formCreate.validate(async val => {
                if (val) {
                    const result = await this.saveSchool();
                    if (result) {
                        this.cancelCreate();
                    }
                }
            });
        },
        showType ({ schoolType, schoolCode, schoolName }) {
            this.showTypeModal = true;
            this.schoolType = schoolType;
            this.schoolCode = schoolCode;
            this.schoolName = schoolName;
        },
        cancelType () {
            this.showTypeModal = false;
        },
        async saveType () {
            const { schoolType, schoolCode, schoolName } = this;
            const [err] = await saveSchool({ schoolType, schoolCode, schoolName });
            this.showTypeModal = false;
            if (err) {
                const msg = err || "修改失败";
                this.errors(msg);
                return false;
            }
            this.queryList();
            // this.success('修改成功');
        },
        //应用出库
        showOutbound ({ schoolCode }) {
            this.$store.commit("changeSchoolCode", schoolCode);
            this.outBoundModal = true;
        },

        toDetail (row) {
            this.$store.commit("changeSchoolCode", row.schoolCode);
            this.$router.push({
                name: "AppPush",
                params: row
            });
        }
    },
    mounted () {
        this.queryList();
        this.initAllSchool();
    }
};
</script>
<style lang="stylus" scoped>
.has__push-wrapper {
}
.plat_type {
    fon-size: 14px;
    display: flex;
    align-items: center;
    height: 50px;
}
.app-outbound {
    >>>.split {
        cursor: pointer;
        color: $primary-color;
    }
}
</style>
