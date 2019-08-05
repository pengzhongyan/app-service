import ajax from "@utils/ajax";
import { GET_PRIVATE_CATEGORY, CHECK_PRIVATE_API } from "./types";
import { awaitWrap } from "@utils";

import { initPrivateCategory, checkAppApi } from "@api/service";

import { Message } from "iview";

export default {
    // 导出数据
    async [GET_PRIVATE_CATEGORY]({ commit }, params) {
        const [err, data] = await initPrivateCategory(params);
        if (err) {
            const msg = err || "获取应用分类失败";
            Message.error(msg);
            return;
        }
        commit("setTypeList", data);
    },
    async [CHECK_PRIVATE_API]({ commit }, params) {
        const [err, data] = await checkAppApi(params);
        if (err) {
            const msg = err || "检查私有云应用所需的api错误";
            Message.error(msg);
        }
        const { checkFlag, missAppList } = data;
        commit("checkApiList", checkFlag === 0 ? missAppList : []);
        return [err, data || []];
    }
};
