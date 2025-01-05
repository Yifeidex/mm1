 // 创建一个Vue实例

 new Vue({
   el: '#app',
   data: {
     message: 'Hello Vue!',
     activeIndex: '1',
     tableData: [],
     leftList: [],
     rightList: [],
     pageInfo: {
       size: 5,
       pageNum: 1,
       total: 0
     },
     loading: false,
     facets: [],
     facetValue: '',
     curType: 'Tbio',
     allTypes: [],
     curTypes: [],
     typePage: 1
   },
   created () {
    let indexParams = this.getUrlParam(window.location.search, 'indexParams');
    let indexParamsObj = JSON.parse(indexParams)
    this.pageInfo = indexParamsObj.pageInfo
    this.facetValue = indexParamsObj.facetValue
    this.curType = indexParamsObj.curType
   },
   mounted() {
     this.getIndexLeftList()
     this.getIndexRightList()
     this.initChart()
   },
   methods: {
     changeFacet(item) {
       let tempArr = this.leftList.filter(facet => facet.facet === item)
       if (tempArr && tempArr.length) {
         this.allTypes = tempArr[0].values
         this.typePage = 1
         this.curTypes = this.allTypes.slice(0, 4)
         this.curType = this.curTypes[0].name
         this.pageInfo.pageNum=1
         this.getIndexRightList()
       }
     },
     getIndexLeftList() {
       fetch('https://pharos-api.ncats.io/graphql', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             operationName: "PaginateData",
             variables: {
               top: this.pageInfo.size,
               skip: this.pageInfo.pageNum,
               filter: {
                 facets: [{
                   facet: '',
                   values: [''],
                   upSets: []
                 }]
               }
             },
             query: "query PaginateData($batchIds: [String], $skip: Int, $top: Int, $filter: IFilter) {\n  batch(targets: $batchIds, filter: $filter) {\n    results: targetResult {\n      count\n      facets {\n        ...facetFields\n        __typename\n      }\n      targets(skip: $skip, top: $top) {\n        ...targetsListFields\n        __typename\n      }\n      ...targetsExtras\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment targetsListFields on Target {\n  ...commonTargetFields\n  interactionDetails: ppiTargetInteractionDetails {\n    ppitypes\n    interaction_type\n    evidence\n    score\n    p_ni\n    p_int\n    p_wrong\n    __typename\n  }\n  diseaseAssociationDetails {\n    name\n    type: dataType\n    evidence\n    zscore\n    conf\n    reference\n    drug: drug_name\n    log2foldchange\n    pvalue\n    score\n    source\n    O2S\n    S2O\n    __typename\n  }\n  ligandAssociationDetails {\n    actVals\n    avgActVal\n    modeOfAction\n    __typename\n  }\n  targetPredictionDetails {\n    similarity\n    result\n    trainingSmiles: training_smiles\n    trainingActivity: training_activity\n    modelName: model_name\n    targetChemblID: target_chembl_id\n    __typename\n  }\n  similarityDetails: similarity {\n    jaccard\n    overlap\n    baseSize\n    testSize\n    commonOptions\n    __typename\n  }\n  sequenceSimilarityDetails {\n    pident\n    evalue\n    bitscore\n    qcovs\n    __typename\n  }\n  pubTatorScore: props(name: \"PubTator Score\") {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment commonTargetFields on Target {\n  ...targetCardFields\n  novelty\n  description\n  uniProtFunction: props(name: \"UniProt Function\") {\n    value\n    __typename\n  }\n  jensenScore: props(name: \"JensenLab PubMed Score\") {\n    value\n    __typename\n  }\n  antibodyURL: props(name: \"Antibodypedia.com URL\") {\n    value\n    __typename\n  }\n  antibodyCount: props(name: \"Ab Count\") {\n    value\n    __typename\n  }\n  diseaseCounts {\n    value\n    __typename\n  }\n  ppiCount: ppiCounts {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment targetCardFields on Target {\n  _tcrdid: tcrdid\n  name\n  gene: sym\n  idgTDL: tdl\n  idgFamily: fam\n  accession: uniprot\n  preferredSymbol\n  hgdata: harmonizome {\n    summary {\n      name\n      value\n      sources\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment facetFields on Facet {\n  facet\n  modifier\n  dataType\n  binSize\n  singleResponse: single_response\n  count\n  values {\n    name\n    count: value\n    __typename\n  }\n  sourceExplanation\n  elapsedTime\n  __typename\n}\n\nfragment targetsExtras on TargetResult {\n  similarityTarget {\n    gene: sym\n    idgTDL: tdl\n    accession: uniprot\n    preferredSymbol\n    __typename\n  }\n  __typename\n}"
           })
         })
         .then(response => response.json()) // 解析响应的JSON
         .then(data => {
           this.leftList = data.data && data.data.batch && data.data.batch.results && data.data.batch.results.facets
           if (this.leftList && this.leftList.length) {
             this.facetValue = this.leftList[0].facet
             this.allTypes = this.leftList[0].values
             this.typePage = 1
             this.curTypes = this.allTypes.slice(0, 4)

           }
         }) // 处理数据
         .catch(error => console.error('Error:', error)); // 错误处理

     },
     nextType() {
       if (this.typePage * 4 < this.allTypes.length) {
         this.typePage++;
         this.curTypes = this.allTypes.slice((this.typePage - 1) * 4, this.typePage * 4);
       }
     },
     prevType() {
       if (this.typePage > 1) {
         this.typePage--;
         this.curTypes = this.allTypes.slice((this.typePage - 1) * 4, this.typePage * 4)
       }
     },
     getIndexRightList() {
       this.loading = true
       fetch('https://pharos-api.ncats.io/graphql', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             operationName: "PaginateData",
             variables: {
               top: this.pageInfo.size,
               skip: this.pageInfo.pageNum,
               filter: {
                 facets: [{
                   facet: this.facetValue,
                   values: [this.curType],
                   upSets: []
                 }]
               }
             },
             query: "query PaginateData($batchIds: [String], $skip: Int, $top: Int, $filter: IFilter) {\n  batch(targets: $batchIds, filter: $filter) {\n    results: targetResult {\n      count\n      facets {\n        ...facetFields\n        __typename\n      }\n      targets(skip: $skip, top: $top) {\n        ...targetsListFields\n        __typename\n      }\n      ...targetsExtras\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment targetsListFields on Target {\n  ...commonTargetFields\n  interactionDetails: ppiTargetInteractionDetails {\n    ppitypes\n    interaction_type\n    evidence\n    score\n    p_ni\n    p_int\n    p_wrong\n    __typename\n  }\n  diseaseAssociationDetails {\n    name\n    type: dataType\n    evidence\n    zscore\n    conf\n    reference\n    drug: drug_name\n    log2foldchange\n    pvalue\n    score\n    source\n    O2S\n    S2O\n    __typename\n  }\n  ligandAssociationDetails {\n    actVals\n    avgActVal\n    modeOfAction\n    __typename\n  }\n  targetPredictionDetails {\n    similarity\n    result\n    trainingSmiles: training_smiles\n    trainingActivity: training_activity\n    modelName: model_name\n    targetChemblID: target_chembl_id\n    __typename\n  }\n  similarityDetails: similarity {\n    jaccard\n    overlap\n    baseSize\n    testSize\n    commonOptions\n    __typename\n  }\n  sequenceSimilarityDetails {\n    pident\n    evalue\n    bitscore\n    qcovs\n    __typename\n  }\n  pubTatorScore: props(name: \"PubTator Score\") {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment commonTargetFields on Target {\n  ...targetCardFields\n  novelty\n  description\n  uniProtFunction: props(name: \"UniProt Function\") {\n    value\n    __typename\n  }\n  jensenScore: props(name: \"JensenLab PubMed Score\") {\n    value\n    __typename\n  }\n  antibodyURL: props(name: \"Antibodypedia.com URL\") {\n    value\n    __typename\n  }\n  antibodyCount: props(name: \"Ab Count\") {\n    value\n    __typename\n  }\n  diseaseCounts {\n    value\n    __typename\n  }\n  ppiCount: ppiCounts {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment targetCardFields on Target {\n  _tcrdid: tcrdid\n  name\n  gene: sym\n  idgTDL: tdl\n  idgFamily: fam\n  accession: uniprot\n  preferredSymbol\n  hgdata: harmonizome {\n    summary {\n      name\n      value\n      sources\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment facetFields on Facet {\n  facet\n  modifier\n  dataType\n  binSize\n  singleResponse: single_response\n  count\n  values {\n    name\n    count: value\n    __typename\n  }\n  sourceExplanation\n  elapsedTime\n  __typename\n}\n\nfragment targetsExtras on TargetResult {\n  similarityTarget {\n    gene: sym\n    idgTDL: tdl\n    accession: uniprot\n    preferredSymbol\n    __typename\n  }\n  __typename\n}"
           })
         })
         .then(response => response.json()) // 解析响应的JSON
         .then(data => {
           this.loading = false
           this.pageInfo.total = data.data && data.data.batch && data.data.batch.results && data.data.batch.results.count
           this.rightList = data.data && data.data.batch && data.data.batch.results && data.data.batch.results.targets
           this.$nextTick(() => {
             this.rightList.forEach(item => {
               this.initChart(item._tcrdid + item.name, item.hgdata.summary)
             })
           })
         }) // 处理数据
         .catch(error => {
           this.loading = false
         }); // 错误处理

     },
     changeType(type) {
       this.curType = type
       this.pageInfo.pageNum=1
       this.getIndexRightList()
     },
     initChart(id, data) {
       let maxData = []
       let dataValue = []
       data.forEach(item => {
         maxData.push({
           name: item.name,
           max: 1
         })
         dataValue.push(item.value)
       })
       var myChart = echarts.init(document.getElementById(id));
       // 指定图表的配置项和数据
       let option = {
         radar: {
           radius: '100%',
           name: {
             show: false
           },
           shape: "circle", // 外环的形状（圆形/多边形）
           splitLine: {
             // 外环分割线样式
             lineStyle: {
               color: "#ccc",
               type: "dashed",
             },
           },
           axisLabel: {
             show: false,
           },
           splitArea: {
             show: false,
           },
           axisLine: {
             show: false,
           },
           indicator: maxData
         },
         series: [{
           name: 'Budget vs spending',
           type: 'radar',
           symbolSize: 0,
           emphasis: {
             label: {
               show: false,
             }
           },
           label: {
             show: false,
           },
           data: [{
             value: dataValue,
             name: '正常区域',
             areaStyle: {
               color: 'rgba(150, 136, 231, 0.6)'
             },
             itemStyle: {
               color: "#9688E7",
             },
             label: {
               show: false,
             },
           }, ]
         }]
       };

       // 使用刚指定的配置项和数据显示图表。
       myChart.setOption(option);

     },
     handleCurrentChange(value) {
       this.pageInfo.pageNum = value
       this.getIndexRightList()
     },
     goDetail(item) {
      let indexParams = {pageInfo:this.pageInfo,facetValue:this.facetValue,curType:this.curType}
       window.location.href = `detail.html?data=${JSON.stringify(item)}&&indexParams=${JSON.stringify(indexParams)}`
     },
     goPage(path){
      if(path==='aiPage'){
        window.location.href = 'aiPage.html'
      }else if(path === 'Target'){
         window.location.href = 'index_v2.html'
      }else if(path==='uploadTarget'){
         window.location.href = 'uploadTarget.html'
      }else if(path==='Homepage'){
        window.location.href = '../gateway/index.html'
     }
     
     },
     getUrlParam(url, paramName) {
      const params = url.slice(url.indexOf('?') + 1).split('&');
      for (let i = 0; i < params.length; i++) {
        const param = params[i].split('=');
        if (param[0] === paramName) {
          return param[1] ? decodeURIComponent(param[1]) : null;
        }
      }
      return null;
    },
   },
 });