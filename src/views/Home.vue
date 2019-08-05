<template>
    <div class="home">
        <div class="home_bar">
            <span>
                {{ $route.meta.name }}
            </span>
        </div>
        <div class="home_content">
            <router-view></router-view>
        </div>
        <div class="home_footer">
            <p>版权信息©2015江苏金智教育信息股份有限公司苏ICP备10204514号</p>
        </div>
    </div>
</template>
<script>
import {} from "@api/service";
import { mapActions } from "vuex";
export default {
    name: "Home",
    meta: { name: "应用出库" },
    components: {},
    props: {},
    data() {
        return {
            name: "应用出库"
        };
    },
    computed: {},
    methods: {
        ...mapActions(["GET_PRIVATE_CATEGORY"])
    },
    mounted() {
        this.GET_PRIVATE_CATEGORY();
    }
};
</script>
<style lang="stylus" scoped>
.home {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $grey-v1;
    &_bar {
        padding: 15px;
        background: #fff;
        box-shadow: $shadow-v1;
        &>span {
            font-size: 13px;
            color: $grey-v2;
        }
    }
    &_content {
        flex-grow: 1;
        background: #fff;
        margin: 15px;
        padding: 15px;
        margin-bottom: 0;
        box-shadow: $shadow-v1;
        overflow-y: auto;
    }
    &_footer {
        p {
            text-align: center;
            height: 32px;
            line-height: 32px;
            font-size: 12px;
            color: $grey-v3;
        }
    }
}
</style>
