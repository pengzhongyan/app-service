<template>
    <div class="public-tool-tip">
        <slot v-bind:appName="data.appName"></slot>
        <Tooltip theme="light" transfer :max-width="200">
            <Icon type="md-alert" :size="18" color="#2D8BF0" />
            <div slot="content" class="name_content">
                <h2 class="title">{{ data.appName }}</h2>
                <div>
                    <label>APPID：</label>
                    <div>{{ data.appId }}</div>
                </div>
                <template v-if="!select">
                    <div>
                        <label>全部服务：</label>
                    </div>
                    <div class="name_tag">
                        <Tag v-for="it in serviceList" :key="it.serviceId">{{
                            it.serviceName
                        }}</Tag>
                    </div>
                </template>
                <template v-else>
                    <div>
                        <label>接入服务：</label>
                    </div>
                    <div class="name_tag">
                        <Tag v-for="it in filterServiceList" :key="it.serviceId">{{
                            it.serviceName
                        }}</Tag>
                    </div>
                </template>
            </div>
        </Tooltip>
    </div>
</template>
<script>
import {} from "@api/service";
export default {
    components: {},
    name: "PublicToolTip",
    props: {
        data: Object,
        select: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        serviceList() {
            if (this.data.serviceList) {
                return this.data.serviceList.map(it => {
                    let text = "";
                    if (it.isWebService) {
                        text = "（PC）";
                    }
                    if (it.isMobileService) {
                        text = "（移动）";
                    }
                    if (it.isWebService && it.isMobileService) {
                        text = "（PC/移动）";
                    }
                    return { ...it, serviceName: it.serviceName + text };
                });
            } else {
                return [];
            }
        },
        filterServiceList() {
            return this.serviceList.filter(it => {
                return this.data.serviceIdList.includes(it.serviceId);
            });
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
.public-tool-tip {
    display: flex;
    justify-content: space-between;
}
</style>
