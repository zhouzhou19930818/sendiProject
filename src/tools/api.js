import { get, post } from './axios';

const auth = '/auth';
const install = '/automatic';
const cdhnm = '/cdhnm';

export default {
    wsUrl: `ws://172.168.201.40:9999/cdhnm/diskFailureRecovery/websocket`,

    logon: (params) => post(`${ auth }/user/signIn`, params),
    getCheckCode: (params) => get(`${ auth }/user/getCheckCode`, params),
    tokenRefresh: () => get(`${ auth }/token/refresh`),
    closeWait: () => get(`${ auth }/token/closeWait`),


    // 装机任务
    getAllInstalTask: () => get(`${ install }/installTaskController/getAllInstalTask`),
    createInstallTask: (params) => post(`${ install }/installTaskController/createInstallTask`, params),
    getInstallTaskByNameOrDesc: (params) => get(`${ install }/installTaskController/getInstallTaskByNameOrDesc?findStr=${ params }`),
    getInstallTaskById: (params) => get(`${ install }/installTaskController/getInstallTaskById?id=${ params }`),

    // 主机
    getAllHost: () => get(`${ install }/hostController/getAllHost`),
    getHostFuzzily: (params) => post(`${ install }/hostController/getHostByStatusAandSn`, params),
    downHostExcel: () => get(`${ install }/hostController/downHostExcel`, null, {responseType: 'blob'}),
    importHostExcel: (params) => post(`${ install }/hostController/importHostExcel`, params),
    updateHost: (params) => post(`${ install }/hostController/updateHostByIdAndSn`, params),

    // 装机模板
    getAllModel: (params) => get(`${ install }/modelController/getAllModel`, params),
    getModelByNameOrDesc: (params) => get(`${ install }/modelController/getModelByNameOrDesc?findStr=${ params }`),
    addModel: (params) => post(`${ install }/modelController/addModel`, params),
    updateModel: (params) => post(`${ install }/modelController/updateModel`, params),
    removeModel: (params) => get(`${ install }/modelController/removeModel?id=${ params }`),
    batchRemoveModel: (params) => get(`${ install }/modelController/batchRemoveModel?ids=${ params }`),


    // 装机结果
    getAllInstallRecord: (params) => get(`${ install }/intallRecordController/getAllInstallRecord`, params),
    getInstallRecordFuzzily: (params) => post(`${ install }/intallRecordController/getInstallRecordByStatusAndTaskIdOrHostSn`, params),
    getInstallRecordByTaskId: (params) => get(`${ install }/intallRecordController/getInstallRecordByTaskId?id=${ params }`),
    exportInstallRecord: (params) => get(`${ install }/intallRecordController/exportInstallRecord?ids=${ params }`, null, {responseType: 'blob'}),

    // 镜像
    getAllDistro: () => get(`${ install }/distroController/getAllDistro`),
    addDistro: (params) => post(`${ install }/distroController/addDistro`, params),
    removeDistro: (params) => get(`${ install }/distroController/removeDistro?id=${ params }`),
    getDistroById: (params) => get(`${ install }/distroController/getDistroById?id=${ params }`),
    updateDistro: (params) => post(`${ install }/distroController/updateDistro`, params),
    getDistroFuzzily: (params) => get(`${ install }/distroController/getDistroByNameUrlDesc?findStr=${ params }`),


    // KS文件
    getAllKs: () => get(`${ install }/ksController/getAllKs`),
    addKs: (params) => post(`${ install }/ksController/addKs`, params),
    removeKs: (params) => get(`${ install }/ksController/removeKs?id=${ params }`),
    getKsById: (params) => get(`${ install }/ksController/getKsById?id=${ params }`),
    updateKs: (params) => post(`${ install }/ksController/updateKs`, params),

    // 磁盘
    getCDHIndex: () => get(`${ cdhnm }/diskFailureRecovery/getStatistics`),
    getUntreatedDiskList: () => get(`${ cdhnm }/diskFailureRecovery/getUnhandleDiskList`),
    getUnfinishedTaskList: () => get(`${ cdhnm }/diskFailureRecovery/getUnfinishedTaskList`),
///cdhnm/diskFailureRecovery/getRecoveredDiskMsgInCompleteStep

    // 获取当前任务每个步骤状态
    getTaskStatusMsg: (params) => post(`${ cdhnm }/diskFailureRecovery/getTaskStatusMsg`, params),

    getRecoveringDiskMsgInUnloadStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInUnloadStep`, params),//卸载列表数据
    createTask: (params) => post(`${ cdhnm }/diskFailureRecovery/createTask`, params),//确定卸载按钮
    completeUnloadDisks: (params) => post(`${ cdhnm }/diskFailureRecovery/unloadDisks`, params),//确定卸载按钮
    confirmUnloadedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmUnloadedDisk`, params),//卸载的下一步
    getRecoveringDiskMsgInChangeStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInChangeStep`, params),//表格
    completeChangeDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/completeChangeDisk`, params),//确定换盘按钮
    confirmChangedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmChangedDisk`, params),//换盘的下一步
    getRecoveringDiskMsgInLoadStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInLoadStep`, params),//表格
    completeLoadDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/loadDisks`, params),//确定换盘按钮
    confirmLoadedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmLoadedDisk`, params), //下一步
    getRecoveringDiskMsgInRebalanceStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInRebalanceStep`, params),//表格
    completeRebalanceDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/rebalancingDisk`, params),//确定换盘按钮
    confirmRebalancedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmRebalancedDisk`, params), //下一步
    getRecoveredDiskMsgInCompleteStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveredDiskMsgInCompleteStep`, params), //完成

    // yarn性能分析
    getClusterBasicInfo: () => get(`${ cdhnm }/cdhMetricWebServer/cluster/getClusterBasicInfo`), // 获取集群列表
    getClusterYarnMemoryInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getClusterYarnMemoryInfo?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存趋势
    getTopProgramMemory: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getTopProgramMemory?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN
    getTopProgramMemoryDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getTopProgramMemoryDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN详情
    exportMemoryExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/application/exportMemoryExcel`, params, {responseType: 'blob'}), // 内存TopN详情导出

    getClusterYarnCpuInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getClusterYarnCpuInfo?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存趋势
    getTopProgramCpu: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getTopProgramCpu?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN
    getTopProgramCpuDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getTopProgramCpuDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN详情
    exportCpuExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/application/exportCpuExcel`, params, {responseType: 'blob'}), // 内存TopN详情导出

    getProgramHistoryDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getProgramHistoryDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&programName=${ params.programName }&currentPage=${ params.currentPage }&pageSize=${ params.pageSize }`), // 获取历史详情
    getOverRunningTimeProgram: (params) => get(`${ cdhnm }/cdhMetricWebServer/application/getOverRunningTimeProgram?clusterName=${ params.clusterName }&overRunningTime=${ params.overRunningTime }&limit=${ params.limit }`), // 程序运行时长

}