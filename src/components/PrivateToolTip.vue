<template>
    <div class="private-tool-tip">
        <slot v-bind:appName="data.appName"></slot>
        <Tooltip
            theme="light"
            transfer
            :max-width="200"
        >
            <Icon
                type="md-alert"
                size="18"
                color="#2D8BF0"
            />
            <div
                slot="content"
                class="name_content"
            >
                <h2 class="title">{{ data.appName }}</h2>
                <div>
                    <label>APPID：</label>
                    <div>{{ data.appId }}</div>
                </div>
                <div>
                    <label>应用类型：</label>
                    <div>{{ text }}</div>
                </div>
                <template v-if="select">
                    <div>
                        <label>接入类型：</label>
                        <div>{{ appText }}</div>
                    </div>
                    <div>
                        <label>接入版本：</label>
                        <div>{{ data.purchaseVersion }}</div>
                    </div>
                </template>
            </div>
        </Tooltip>
    </div>
</template>
<script>
import { } from "@api/service";
export default {
    components: {},
    name: "PrivateToolTip",
    props: {
        data: Object,
        select: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        appText () {
            let text = "";
            if (this.data.isPurchaseWeb) {
                text = "PC  ";
            }
            if (this.data.isPurchaseMobile) {
                text += "移动";
            }

            return text;
        },
        text () {
            let text = "";
            if (this.data.isWebApp) {
                text = "PC  ";
            }
            if (this.data.isMobileApp) {
                text += "移动";
            }
            return text;
        }
    }
};
</script>
<style lang="stylus" scoped>
.name_content {
    display: flex;
    flex-direction: column;
    & > div {
        display: flex;
        label {
            width: 60px;
            color: $grey-v3;
        }
    }
    .title {
        font-size: 16px;
        color: #333;
    }
    .name_tag {
        display: flex;
        flex-flow: row wrap;
    }
}
.private-tool-tip {
    display: flex;
    justify-content: space-between;
}
</style>
