export default {
    setTypeList(state, data) {
        state.appTypeList = data;
    },
    checkApiList(state, data) {
        state.apiList = data;
    },
    changeTipStatus(state, data) {
        state.tipStatus = data;
    },
    changeSchoolCode(state, data) {
        state.schoolCode = data;
    }
};
