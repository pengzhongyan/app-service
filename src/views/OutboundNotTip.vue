<template>
    <div class="outbound-not-tip">
        <Tooltip
            placement="top"
            theme="light"
            max-width="400"
            always
            :disabled="disabled"
        >
            <slot></slot>
            <div slot="content">
                <div class="card">
                    <p class="title">
                        <Icon
                            type="md-close-circle"
                            color="#ed4014"
                            size="20"
                        />
                        <span>无法出库</span>
                    </p>
                    <ul class="has__push-wrapper ">
                        <li
                            v-for="(item, index) in apiList"
                            :key="index"
                        >
                            <dl>
                                <dt class="mt-15">{{ item.appName }}应用 缺少以下API，请联系智校云平台管理员注册接口后再出库
                                </dt>
                                <dd class="dd">API链接:</dd>
                                <dd
                                    v-for="child in item.missApiList"
                                    :key="child.apiId"
                                    class="api"
                                >
                                    <div
                                        class="api_detail"
                                        :ref="'onCopy_'+child.apiId"
                                        :title="child.apiName+' '+child.apiUrl"
                                    >{{child.apiName}}{{child.apiUrl}}</div>
                                    <div
                                        class="Copy-btn"
                                        title="复制"
                                    >
                                        <Icon
                                            @click.native="onCopy(child.apiId)"
                                            type="ios-copy"
                                            size="18"
                                            color="#ccc"
                                        />
                                    </div>
                                </dd>
                            </dl>
                        </li>
                    </ul>
                    <div class="btn mtb-10">
                        <Button
                            type="primary"
                            @click.native="close"
                        >我知道了</Button>
                    </div>
                </div>
            </div>
        </Tooltip>
    </div>
</template>
<script>
import { } from "@api/service";
import { mapState } from "vuex";
import Clipboard from "clipboard";
export default {
    components: {},
    name: "OutboundNotTip",
    props: {},
    data () {
        return {
            disabled: true
        };
    },
    computed: {
        ...mapState(["apiList"])
    },
    watch: {
        "apiList.length" (length) {
            this.disabled = length === 0;
        }
    },
    methods: {
        close () {
            this.$emit("on-click");
            //重置数据否则会导致watch不到数据变化
            this.$store.commit('checkApiList', []);
            this.$store.commit("changeTipStatus", 1);
        },
        onCopy (appid) {
            const dom = this.$refs['onCopy_' + appid][0]
            const clipboard = new Clipboard(".Copy-btn", {
                target () {
                    return dom;
                }
            });
            clipboard.on("success", e => {
                e.clearSelection();
                this.success("复制成功！");
                clipboard.destroy();
            });
        }
    }
};
</script>
<style lang="stylus" scoped>
>>>.ivu-card-head {
    border-bottom: none;
}
.outbound-not-tip {
    display: inline-block;
}
.card {
    width: 360px;
    border-radius: 5px;
    padding: 10px;
    .title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
    }
}
.has__push-wrapper {
    max-height: 300px;
    overflow: auto;
    li {
        dl {
            margin-bottom: 10px;
            .mt-15 {
                font-size: 13px;
                color: #515A6E;
            }
            .dd {
                color: #7F7F7F;
            }
            .api {
                margin-bottom: 10px;
                display: flex;
                align-items: flex-end;
                .api_detail {
                    font-size: 12px;
                    color: #ff9900;
                    clamp(3);
                }
                .Copy-btn {
                    text-align: center;
                    flex-shrink: 0;
                    width: 30px;
                    cursor: pointer;
                }
            }
        }
    }
}
.btn {
    text-align: right;
}
</style>
