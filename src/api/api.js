/* eslint-disable */
/**
 * 本文件由工具自动生成，请勿随意改动！！！
 * @name CMP Devops API
 * @description The API definition for the Devops Console of Cloud Manage Platform.
 * @tutorial public/wec-devops-superapp.yaml
 */
const DEV_MODE = process.env.NODE_ENV === 'development'

const API_BASE = DEV_MODE ? '/wec-devops-superapp' : ''

const _basePath = (url) => {
    return `${API_BASE}${url}`
}

export default {
    school_queryschool: _basePath('/school/querySchool'), // 根据租户名称、类型查询学校列表
    school_initallschool: _basePath('/school/initAllSchool'), // 根据dubbo接口获取所有学校，初始化下拉学校列表
    school_saveschool: _basePath('/school/saveSchool'), // 保存学校配置信息，包括新增和修改
    school_selectschool: _basePath('/school/selectSchool'), // 查询学校基础信息
    pushapp_readprivateappforpush: _basePath('/pushApp/readPrivateAppForPush'), // 读取私有云可推送的应用
    pushapp_initprivatecategory: _basePath('/pushApp/initPrivateCategory'), // 初始化私有云应用类别列表
    pushapp_readpublicappforpush: _basePath('/pushApp/readPublicAppForPush'), // 读取公有云可推送的应用
    pushapp_pushschoolapp: _basePath('/pushApp/pushSchoolApp'), // 确认出库到学校
    school_queryprivateapp: _basePath('/school/queryPrivateApp'), // 查询已接入的私有云应用
    school_querypublicapp: _basePath('/school/queryPublicApp'), // 查询已接入的公有云应用
    pushapp_checkappapi: _basePath('/pushApp/checkAppApi'), // 检查私有云应用所需的api是否存在
    restful_getschoolpushedapps: _basePath('/restful/getSchoolPushedApps'), // 查询学校已推送的应用信息
    restful_setapppurchasestatus: _basePath('/restful/setAppPurchaseStatus'), // 设置学校应用接入状态
}
