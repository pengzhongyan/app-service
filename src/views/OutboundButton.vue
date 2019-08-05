<template>
    <div class="outbound-button">
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
                    <p class="title ptb-10">
                        <Icon
                            type="md-alert"
                            color="#ff9900"
                            size="20"
                        /><span>以下应用已经出库至学校，将不会重复出库</span>
                    </p>
                    <ul class="has__push-wrapper">
                        <li
                            v-for="(item, index) in model"
                            :key="index"
                        >
                            <span class="name">{{ item.appName }}</span>
                            <span
                                v-show="item.purchaseVersion"
                                class="version"
                            >{{
                                item.purchaseVersion
                                }}</span>
                        </li>
                    </ul>
                    <div class="btn mtb-10">
                        <Button
                            type="primary"
                            @click.native="surePush"
                        >确定</Button>
                    </div>
                </div>
            </div>
        </Tooltip>
    </div>
</template>
<script>
import { } from "@api/service";
export default {
    components: {},
    name: "OutboundButton",
    props: {
        model: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        // 'model.length' (length) {
        //     this.disabled = length === 0;
        // }
    },
    data () {
        return {
            disabled: true
        };
    },

    methods: {
        surePush () {
            this.$emit("on-click");
        }
    }
};
</script>
<style lang="stylus" scoped>
>>>.ivu-card-head {
    border-bottom: none;
}
.outbound-button {
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
    border-top: 1px solid $grey-v1;
    border-left: 1px solid $grey-v1;
    border-right: 1px solid $grey-v1;
    max-height: 300px;
    overflow: auto;
    li {
        display: flex;
        padding: 8px 10px;
        justify-content: space-between;
        border-bottom: 1px solid $grey-v1;
        font-size: 13px;
        .name {
            width: 200px;
            ellipsis();
        }
        .version {
            color: $grey-v2;
            ellipsis();
        }
    }
}
.btn {
    text-align: right;
}
</style>
