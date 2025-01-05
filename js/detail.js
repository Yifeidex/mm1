// 创建一个Vue实例
new Vue({
  el: '#app',
  data: {
    loading: false,
    loading1: false,
    loading2: false,
    paramData: {},
    detailData: {},
    description: '',
    ensembls: [],
    symbols: [],
    knowledgeTable: [],
    dtos: '',
    pantherClasses: '',
    targetOptions: [],
    dataSourceOptions: [],
    tissueOptions: [],
    cancerTypeOptions: [],
    tableData1: [],
    tableData2: [],
    sequences: [],
    interactingViruses: [],
    goComponent: [],
    associations: [],
    uniprotKeyword: [],
    gwasTrait: [],
    indexParams: {}
  },
  mounted() {
    this.indexParams = this.getUrlParam(window.location.search, 'indexParams');
    const paramValue = this.getUrlParam(window.location.search, 'data');
    this.paramData = JSON.parse(paramValue)
    if (this.paramData) {
      this.getOptions()
      this.getBaseInfo()
      this.getDetailInfo()
      if (this.paramData.hgdata && this.paramData.hgdata.summary) {
        this.initChart('achart_1', this.paramData.hgdata.summary)
        this.paramData.hgdata.summary.sort((a, b) => b.value - a.value);
        this.knowledgeTable = this.paramData.hgdata.summary.splice(0, 5)
      }
    }
    this.initChart3()
    this.initChart2('achart2')
    this.initChart2('achart3')
    this.initChart5()
    this.initChart2('achart6')
    this.initChart6()
  },
  methods: {
    goBack() {
      window.location.href = `index_v2.html?indexParams=${this.indexParams}`
    },
    getOptions() {
      this.loading = true
      fetch('https://pharos-api.ncats.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "operationName": "getTARGETSPredictions",
          "variables": {
            "apiCode": [
              "ttsc"
            ],
            "name": this.paramData.gene
          },
          "query": "query getTARGETSPredictions($name: String, $apiCode: [String]) {\n  model: target(q: {sym: $name, uniprot: $name, stringid: $name}) {\n    name\n    communityData(apiCode: $apiCode)\n    __typename\n  }\n}"
        })
      })
        .then(response => response.json()) // 解析响应的JSON
        .then(data => {
          this.loading = false
          if (data.data.model && data.data.model.communityData && data.data.model.communityData.length) {
            let arr1 = []
            let arr2 = []
            let arr3 = []
            let arr4 = []
            data.data.model.communityData.forEach(item1 => {
              item1.forEach(item2 => {
                item2.predictions.forEach(item3 => {
                  arr3.push(item3.value && item3.value.name)
                  let tempObj = { CoexpressedTarget: '', DataSource: '', Tissue: '', CancerType: '' }
                  tempObj.CoexpressedTarget = item3.value.name
                  item3.value && item3.value.identifier.forEach(item4 => {
                    if (item4.name === 'Data Source') {
                      arr1.push(item4.value)
                      tempObj.DataSource = item4.value
                    }
                    if (item4.name === 'Cancer Type') {
                      arr2.push(item4.value)
                      tempObj.CancerType = item4.value
                    }
                    if (item4.name === 'Tissue') {
                      arr4.push(item4.value)
                      tempObj.Tissue = item4.value
                    }

                  })
                  if (tempObj.Tissue) {
                    this.tableData1.push(tempObj)
                  } else {
                    this.tableData2.push(tempObj)
                  }

                })
              })
            })
            arr1 = [...new Set(arr1)];
            arr1.forEach(item => {
              this.dataSourceOptions.push({ label: item, value: item })
            })
            arr2 = [...new Set(arr2)];
            arr2.forEach(item => {
              this.cancerTypeOptions.push({ label: item, value: item })
            })
            arr3 = [...new Set(arr3)];
            arr3.forEach(item => {
              this.targetOptions.push({ label: item, value: item })
            })
            arr4 = [...new Set(arr4)];
            arr4.forEach(item => {
              this.tissueOptions.push({ label: item, value: item })
            })
            console.log(arr3, 'ssssssssssssssssssssssssss')
          }
        }) // 处理数据
        .catch(error => {
          this.loading = false
        }); // 错误处理
    },
    getDetailInfo() {
      this.loading1 = true
      fetch('https://pharos-api.ncats.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "operationName": "fetchTargetDetails",
          "variables": {
            "term": this.paramData.gene
          },
          "query": "query fetchTargetDetails($term: String, $diseasetop: Int, $diseaseskip: Int, $publicationstop: Int, $publicationsskip: Int, $orthologstop: Int, $orthologsskip: Int, $ppistop: Int, $ppisskip: Int, $drugstop: Int, $drugsskip: Int, $ligandstop: Int, $ligandsskip: Int) {\n  targets: target(q: {sym: $term, uniprot: $term, stringid: $term}) {\n    ...targetsDetailsFields\n    __typename\n  }\n}\n\nfragment targetsDetailsFields on Target {\n  ...targetsListFields\n  ...targetServerDetailsFields\n  dataVersions {\n    key\n    dataSources {\n      name\n      description\n      url\n      license\n      licenseURL\n      citation\n      files {\n        key\n        file\n        version\n        releaseDate\n        downloadDate\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  dataSources\n  affiliateLinks: affiliate_links {\n    sourceName\n    description\n    url\n    __typename\n  }\n  sequenceVariants: sequence_variants {\n    startResidue\n    residue_info {\n      aa\n      bits\n      __typename\n    }\n    __typename\n  }\n  sequenceAnnotations: sequence_annotations {\n    startResidue\n    endResidue\n    type\n    name\n    __typename\n  }\n  pdbs: xrefs(source: \"PDB\") {\n    name\n    __typename\n  }\n  orthologCounts {\n    value\n    __typename\n  }\n  orthologs(top: $orthologstop, skip: $orthologsskip) {\n    ...ortholog_fields\n    __typename\n  }\n  pubTatorScores {\n    year\n    score\n    __typename\n  }\n  pubmedScores {\n    year\n    score\n    __typename\n  }\n  patentCounts {\n    year\n    count\n    __typename\n  }\n  publications: publications(top: $publicationstop, skip: $publicationsskip) {\n    ...publication_fields\n    __typename\n  }\n  tinx {\n    score\n    novelty\n    disease {\n      doid\n      name\n      __typename\n    }\n    __typename\n  }\n  omimCount: mimCount\n  omimTerms: mim {\n    term\n    mimid\n    __typename\n  }\n  expressionTree\n  diseaseTree\n  tinxTree\n  expressions(top: 10000) {\n    type\n    sourceRank: source_rank\n    tissue\n    qual\n    url\n    value\n    evidence\n    zscore\n    conf\n    pub {\n      pmid\n      __typename\n    }\n    uberon {\n      name\n      uid\n      ancestors {\n        name\n        uid\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  gtex {\n    tissue\n    tpm\n    tpm_rank\n    tpm_male\n    tpm_male_rank\n    tpm_female\n    tpm_female_rank\n    uberon {\n      name\n      uid\n      ancestors {\n        name\n        uid\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  uniprotKeyword: xrefs(source: \"UniProt Keyword\") {\n    value\n    name\n    __typename\n  }\n  drgcResources: drgc_resources {\n    resourceType\n    apiResult: detailBlob\n    __typename\n  }\n  gwasAnalytics {\n    associations {\n      ensgID\n      traitCountForGene\n      studyCountForGene\n      trait\n      efoID\n      studyCountForAssoc\n      snpCount\n      wSnpCount\n      geneCountForTrait\n      studyCountForTrait\n      medianPvalue\n      medianOddsRatio\n      betaCount\n      meanStudyN\n      rcras\n      meanRank\n      meanRankScore\n      diseaseName\n      __typename\n    }\n    __typename\n  }\n  gwasTrait: facetValues(facetName: \"GWAS\")\n  mgiPhenotype: facetValues(facetName: \"JAX/MGI Phenotype\")\n  hpaTissueSpecificityIndex: props(name: \"HPA Tissue Specificity Index\") {\n    name\n    value\n    __typename\n  }\n  hpmProteinTissueSpecificityIndex: props(\n    name: \"HPM Protein Tissue Specificity Index\"\n  ) {\n    name\n    value\n    __typename\n  }\n  gtexTissueSpecificityIndex: props(name: \"GTEx Tissue Specificity Index\") {\n    name\n    value\n    __typename\n  }\n  hpaRNATissueSpecificityIndex: props(name: \"HPA RNA Tissue Specificity Index\") {\n    name\n    value\n    __typename\n  }\n  hpaProteinTissueSpecificity: props(name: \"HPA Protein Tissue Specificity\") {\n    name\n    value\n    __typename\n  }\n  hpmGeneTissueSpecificityIndex: props(name: \"HPM Gene Tissue Specificity Index\") {\n    name\n    value\n    __typename\n  }\n  interactingViruses {\n    taxonomyID\n    name\n    nucleic1\n    nucleic2\n    order\n    family\n    subfamily\n    genus\n    species\n    interactionDetails {\n      finalLR\n      protein_name\n      protein_ncbi\n      pdbIDs\n      __typename\n    }\n    __typename\n  }\n  nearestTclin {\n    upstream {\n      ...pathDetails\n      __typename\n    }\n    downstream {\n      ...pathDetails\n      __typename\n    }\n    __typename\n  }\n  communityAPIs {\n    code\n    default\n    section\n    related_section\n    model\n    url\n    description\n    link\n    __typename\n  }\n  __typename\n}\n\nfragment pathDetails on SharedPathwayDetails {\n  distance\n  tClinTarget {\n    ...targetCardFields\n    __typename\n  }\n  sharedPathways {\n    name\n    sourceID\n    url\n    type\n    __typename\n  }\n  __typename\n}\n\nfragment targetCardFields on Target {\n  _tcrdid: tcrdid\n  name\n  gene: sym\n  idgTDL: tdl\n  idgFamily: fam\n  accession: uniprot\n  preferredSymbol\n  hgdata: harmonizome {\n    summary {\n      name\n      value\n      sources\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment targetsListFields on Target {\n  ...commonTargetFields\n  interactionDetails: ppiTargetInteractionDetails {\n    ppitypes\n    interaction_type\n    evidence\n    score\n    p_ni\n    p_int\n    p_wrong\n    __typename\n  }\n  diseaseAssociationDetails {\n    name\n    type: dataType\n    evidence\n    zscore\n    conf\n    reference\n    drug: drug_name\n    log2foldchange\n    pvalue\n    score\n    source\n    O2S\n    S2O\n    __typename\n  }\n  ligandAssociationDetails {\n    actVals\n    avgActVal\n    modeOfAction\n    __typename\n  }\n  targetPredictionDetails {\n    similarity\n    result\n    trainingSmiles: training_smiles\n    trainingActivity: training_activity\n    modelName: model_name\n    targetChemblID: target_chembl_id\n    __typename\n  }\n  similarityDetails: similarity {\n    jaccard\n    overlap\n    baseSize\n    testSize\n    commonOptions\n    __typename\n  }\n  sequenceSimilarityDetails {\n    pident\n    evalue\n    bitscore\n    qcovs\n    __typename\n  }\n  pubTatorScore: props(name: \"PubTator Score\") {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment commonTargetFields on Target {\n  ...targetCardFields\n  novelty\n  description\n  uniProtFunction: props(name: \"UniProt Function\") {\n    value\n    __typename\n  }\n  jensenScore: props(name: \"JensenLab PubMed Score\") {\n    value\n    __typename\n  }\n  antibodyURL: props(name: \"Antibodypedia.com URL\") {\n    value\n    __typename\n  }\n  antibodyCount: props(name: \"Ab Count\") {\n    value\n    __typename\n  }\n  diseaseCounts {\n    value\n    __typename\n  }\n  ppiCount: ppiCounts {\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment ligandCardFields on Ligand {\n  ligid\n  name\n  isdrug\n  smiles\n  synonyms {\n    name\n    value\n    __typename\n  }\n  activityCount: actcnt\n  targetCount\n  activities(all: false) {\n    type\n    moa\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment ortholog_fields on Ortholog {\n  species\n  sym\n  url: mod_url\n  name\n  dbid\n  geneid\n  source\n  __typename\n}\n\nfragment publication_fields on PublicationObject {\n  pmid\n  title\n  journal\n  date\n  authors\n  abstract\n  fetch_date\n  generifs {\n    text\n    date\n    __typename\n  }\n  __typename\n}\n\nfragment pathway_fields on Pathway {\n  name\n  type\n  url\n  sourceID\n  targetCounts {\n    name\n    value\n    __typename\n  }\n  __typename\n}\n\nfragment targetServerDetailsFields on Target {\n  ...commonTargetFields\n  symbols: synonyms(name: \"symbol\") {\n    name\n    value\n    __typename\n  }\n  uniprotIds: synonyms(name: \"uniprot\") {\n    name\n    value\n    __typename\n  }\n  ensemblIDs: xrefs(source: \"Ensembl\") {\n    name\n    __typename\n  }\n  dto {\n    name\n    __typename\n  }\n  pantherClasses {\n    name\n    pcid\n    parents\n    __typename\n  }\n  generifCount\n  publicationCount\n  goCounts {\n    value\n    name\n    __typename\n  }\n  ligandCounts {\n    name\n    value\n    __typename\n  }\n  sequence: seq\n  ppis(top: $ppistop, skip: $ppisskip) {\n    props {\n      name\n      value\n      __typename\n    }\n    target {\n      ...targetCardFields\n      __typename\n    }\n    __typename\n  }\n  diseases(top: $diseasetop, skip: $diseaseskip) {\n    ...disease_fields\n    __typename\n  }\n  pathwayCounts {\n    name\n    value\n    __typename\n  }\n  pathways(top: 5, getTopForEachType: true) {\n    ...pathway_fields\n    __typename\n  }\n  goComponent: go(top: 5, filter: {facets: [{facet: \"type\", values: [\"C\"]}]}) {\n    term\n    evidence\n    explanation\n    assigned_by\n    __typename\n  }\n  goFunction: go(top: 5, filter: {facets: [{facet: \"type\", values: [\"F\"]}]}) {\n    term\n    evidence\n    explanation\n    assigned_by\n    __typename\n  }\n  goProcess: go(top: 5, filter: {facets: [{facet: \"type\", values: [\"P\"]}]}) {\n    term\n    evidence\n    explanation\n    assigned_by\n    __typename\n  }\n  drugs: ligands(top: $drugstop, skip: $drugsskip, isdrug: true) {\n    ...ligandCardFields\n    __typename\n  }\n  ligands(top: $ligandstop, skip: $ligandsskip, isdrug: false) {\n    ...ligandCardFields\n    __typename\n  }\n  __typename\n}\n\nfragment disease_fields on Disease {\n  name\n  associationCount\n  directAssociationCount\n  mondoID\n  associations(top: 100) {\n    did\n    drug\n    type\n    name\n    source\n    zscore\n    evidence\n    conf\n    reference\n    log2foldchange\n    pvalue\n    score\n    __typename\n  }\n  __typename\n}"
        })
      })
        .then(response => response.json()) // 解析响应的JSON
        .then(data => {
          this.loading1 = false
          this.detailData = data.data.targets
          if (this.detailData.pantherClasses && this.detailData.pantherClasses.length) {
            this.detailData.pantherClasses.reverse().forEach(item => {
              this.pantherClasses += item.name + ' / '
            })
          }
          if (this.detailData && this.detailData.dto && this.detailData.dto.length) {
            this.dtos = ''
            this.detailData.dto.reverse().forEach(item => {
              this.dtos += item.name + ' / '
            })
          }

          if (this.detailData && this.detailData.interactingViruses && this.detailData.interactingViruses.length) {
            this.interactingViruses = this.detailData.interactingViruses
          }

          if (this.detailData && this.detailData.goComponent && this.detailData.goComponent.length) {
            this.goComponent = this.detailData.goComponent
          }

          if (this.detailData && this.detailData.gwasAnalytics && this.detailData.gwasAnalytics.associations && this.detailData.gwasAnalytics.associations.length) {
            this.associations = this.detailData.gwasAnalytics.associations
          }

          if (this.detailData && this.detailData.uniprotKeyword && this.detailData.uniprotKeyword.length) {
            this.uniprotKeyword = this.detailData.uniprotKeyword
          }
          if (this.detailData && this.detailData.gwasTrait && this.detailData.gwasTrait.length) {
            this.gwasTrait = this.detailData.gwasTrait
          }


        }) // 处理数据
        .catch(error => {
          this.loading1 = false
        }); // 错误处理
    },
    getBaseInfo() {
      this.loading2 = true
      fetch('https://www.ebi.ac.uk/proteins/api/proteins/' + this.paramData.accession, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(response => response.json()) // 解析响应的JSON
        .then(data => {
          this.loading2 = false
          console.log(data, 'sssssss99999999999999')
          if (data && data.comments && data.comments.length) {
            this.description = data.comments[0] && data.comments[0].text && data.comments[0].text.length ? data.comments[0].text[0].value : ''
          }
          if (data && data.dbReferences && data.dbReferences.length) {
            data.dbReferences.forEach(item => {
              if (item.type === 'Ensembl') {
                this.ensembls.push(item)
              }
            })
          }
          if (data && data.gene && data.gene.length) {
            if (data.gene[0] && data.gene[0].synonyms) {
              this.symbols = data.gene[0].synonyms
            }
          }
          if (data && data.sequence && data.sequence.sequence) {
            let tempStr = data.sequence.sequence
            this.sequence = this.splitStringEvery10Chars(tempStr)
          }

        }) // 处理数据
        .catch(error => {
          this.loading2 = false
        }); // 错误处理
    },
    splitStringEvery10Chars(str) {
      let result = [];
      let index = 0
      for (let i = 0; i < str.length; i += 10) {
        index++
        let chunk = str.substring(i, i + 10);
        if (chunk.length === 10) {
          result.push({ order: (index) * 10, value: chunk });
        } else {
          result.push({ order: (index - 1) * 10 + chunk.length, value: chunk });
        }

      }
      return result;
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
          radius: '90%',
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
          },]
        }]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);

    },
    initChart2(id, data) {
      var myChart = echarts.init(document.getElementById(id));
      // 指定图表的配置项和数据
      var uploadedDataURL = "https://www.isqqw.com/asset/get/s/data-1498994055008-rJJ5SUU4W.csv";
      var stratify = d3.stratify()
        .parentId(function (d) {
          return d.id.substring(0, d.id.lastIndexOf("."));
        });
      d3.csv(uploadedDataURL, function (error, rawData) {
        if (error) throw error;
        var root = stratify(rawData)
          .sum(function (d) {
            return d.value;
          })
          .sort(function (a, b) {
            return b.value - a.value;
          });
        var maxDepth = 0;
        var seriesData = root.descendants().map(function (node) {
          maxDepth = Math.max(maxDepth, node.depth);
          return [
            node.value,
            node.depth,
            node.id
          ];
        });
        var pieces = [];
        for (var i = 0; i <= maxDepth; i++) {
          pieces.push({
            value: i,
            label: 'Level ' + i
          });
        }

        function renderItem(params, api) {
          var context = params.context;
          if (!context.layout) {

            d3.pack()
              .size([api.getWidth() - 2, api.getHeight() - 2])
              .padding(3)(root);

            context.layout = {};
            root.descendants().forEach(function (node) {
              context.layout[node.id] = {
                x: node.x,
                y: node.y,
                r: node.r,
                isLeaf: !node.children || !node.children.length
              };
            });
          }

          var nodePath = api.value(2);
          var itemLayout = context.layout[nodePath];

          var nodeName = '';
          var textFont = api.font({
            fontSize: 12,
            fontFamily: 'Arial'
          });

          if (itemLayout.isLeaf && itemLayout.r > 10) {
            nodeName = nodePath.slice(nodePath.lastIndexOf('.') + 1).split(/(?=[A-Z][^A-Z])/g).join('\n');
            nodeName = echarts.format.truncateText(nodeName, itemLayout.r, textFont, '.');
          }

          return {
            type: 'circle',
            shape: {
              cx: itemLayout.x,
              cy: itemLayout.y,
              r: itemLayout.r
            },
            z2: api.value(1) * 2,
            style: api.style({
              text: nodeName,
              textFont: textFont,
              textPosition: 'inside'
            }),
            styleEmphasis: api.style({
              text: nodeName,
              textPosition: 'inside',
              textFont: textFont,
              stroke: 'rgba(0,0,0,0.5)',
              lineWidth: 3
            })
          };
        }

        var option = {
          xAxis: {
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            }
          },
          tooltip: {},
          visualMap: {
            show: false,
            type: 'piecewise',
            bottom: 40,
            pieces: pieces,
            dimension: 1,
            inRange: {
              color: ['#9588E8', '#e0ffff']
            }
          },
          series: {
            type: 'custom',
            renderItem: renderItem,
            encode: {
              tooltip: 0,
              itemName: 2
            },
            label: {
              show: false
            },
            data: seriesData
          }
        };
        myChart.setOption(option);
      });
    },
    initChart3(data) {
      var myChart = echarts.init(document.getElementById('achart4'));
      // 指定图表的配置项和数据
      let option = {
        "tooltip": {
          "position": "top"
        },
        "grid": [{
          "containLabel": true
        }],
        "xAxis": [{
          "gridIndex": 0,
          "offset": 0,
          "position": "top",
          "type": "category",
          "data": ['JensenLab TISSUES', 'GTEx - Female', 'GTEx - Female', 'GTEx - Female', 'HPM Protein'],
          "nameLocation": "center",
          "nameTextStyle": {
            "fontWeight": "bold",
            "fontSize": "0.14rem",
            "color": "#606060"
          },
          "axisLabel": {
            "interval": 0,
            "rotate": -45,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
          "splitArea": {
            "show": true
          }
        }],
        "yAxis": [{
          "type": "category",
          "gridIndex": 0,
          "data": ["Expression Type", "epididymis", "skeletal muscle tissue", "fallopian tube", "skin of body", "choroid plexus", "lymph node", "tongue", "cardiac muscle tissue", "tonsil", "breast", "thyroid gland", "spleen", "prostate gland", "thymus", "rectum", "testis", "cerebellar vermis", "smooth muscle tissue", "flocculonodular lobe", "endometrium", "parathyroid gland", "central gray substance of midbrain", "adrenal gland"],
          "axisLine": {
            "lineStyle": {
              "color": "#000"
            }
          },
          "axisLabel": {
            "interval": 0,
            "rotate": 0,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
          "splitArea": {
            "show": true
          }
        }],
        "visualMap": {
          "show": false,
          "right": 0,
          "top": 10,
          "align": "left",
          "pieces": [{
            "value": 0,
            "label": "模拟费率0",
            "color": "#fff"
          }, {
            "value": 1,
            "label": "模拟费率1",
            "color": "rgb(223,225,229)"
          }, {
            "value": 2,
            "label": "模拟费率2",
            "color": "rgb(209,205,219)"
          }, {
            "value": 3,
            "label": "模拟费率3",
            "color": "rgb(169,165,189)"
          }, {
            "value": 4,
            "label": "模拟费率4",
            "color": "rgb(139,145,159)"
          }, {
            "value": 5,
            "label": "模拟费率5",
            "color": "rgb(75,90,110)"
          }, {
            "value": 6,
            "label": "模拟费率6",
            "color": "rgb(55,70,90)"
          }, {
            "value": 7,
            "label": "模拟费率7",
            "color": "rgb(255,207,58)"
          }, {
            "value": 8,
            "label": "模拟费率8",
            "color": "rgb(51,123,158)"
          }, {
            "value": 9,
            "label": "模拟费率9",
            "color": "rgb(255,116,58)"
          }]
        },
        "series": [{
          "name": "",
          "type": "heatmap",
          "coordinateSystem": "cartesian2d",
          "data": [
            [0, 0, 3],
            [0, 1, 1],
            [0, 2, 0],
            [0, 3, 4],
            [0, 4, 0],
            [0, 5, 1],
            [0, 6, 2],
            [0, 7, 4],
            [0, 8, 4],
            [0, 9, 0],
            [0, 10, 0],
            [0, 11, 0],
            [0, 12, 2],
            [0, 13, 2],
            [0, 14, 0],
            [0, 15, 0],
            [0, 16, 0],
            [0, 17, 3],
            [0, 18, 0],
            [0, 19, 2],
            [0, 20, 0],
            [0, 21, 0],
            [0, 22, 2],
            [0, 23, 9],
            [1, 0, 1],
            [1, 1, 0],
            [1, 2, 0],
            [1, 3,],
            [1, 4, 0],
            [1, 5, 0],
            [1, 6, 2],
            [1, 7, 0],
            [1, 8, 4],
            [1, 9, 0],
            [1, 10, 0],
            [1, 11, 0],
            [1, 12, 0],
            [1, 13, 1],
            [1, 14, 4],
            [1, 15, 0],
            [1, 16, 0],
            [1, 17, 0],
            [1, 18, 0],
            [1, 19, 0],
            [1, 20, 0],
            [1, 21, 0],
            [1, 22, 6],
            [1, 23, 8],
            [2, 0, 1],
            [2, 1, 6],
            [2, 2, 4],
            [2, 3, 4],
            [2, 4, 4],
            [2, 5, 6],
            [2, 6, 2],
            [2, 7, 1],
            [2, 8, 4],
            [2, 9, 0],
            [2, 10, 4],
            [2, 11, 2],
            [2, 12, 4],
            [2, 13, 2],
            [2, 14, 3],
            [2, 15, 6],
            [2, 16, 1],
            [2, 17, 3],
            [2, 18, 7],
            [2, 19, 6],
            [2, 20, 0],
            [2, 21, 6],
            [2, 22, 3],
            [2, 23, 8],
            [3, 0, 1],
            [3, 1, 1],
            [3, 2, 6],
            [3, 3, 6],
            [3, 4, 2],
            [3, 5, 8],
            [3, 6, 3],
            [3, 7, 2],
            [3, 8, 2],
            [3, 9, 6],
            [3, 10, 0],
            [3, 11, 5],
            [3, 12, 1],
            [3, 13, 6],
            [3, 14, 2],
            [3, 15, 4],
            [3, 16, 1],
            [3, 17, 2],
            [3, 18, 5],
            [3, 19, 3],
            [3, 20, 0],
            [3, 21, 4],
            [3, 22, 6],
            [3, 23, 7],
            [4, 0, 1],
            [4, 1, 1],
            [4, 2, 6],
            [4, 3, 6],
            [4, 4, 2],
            [4, 5, 8],
            [4, 6, 3],
            [4, 7, 2],
            [4, 8, 2],
            [4, 9, 6],
            [4, 10, 0],
            [4, 11, 5],
            [4, 12, 1],
            [4, 13, 6],
            [4, 14, 2],
            [4, 15, 4],
            [4, 16, 1],
            [4, 17, 2],
            [4, 18, 5],
            [4, 19, 3],
            [4, 20, 0],
            [4, 21, 4],
            [4, 22, 6],
            [4, 23, 7]
          ],
          "label": {
            "normal": {
              "show": false
            }
          },
          "gridIndex": 0,
          "xAxisIndex": 0,
          "yAxisIndex": 0,
          "itemStyle": {
            "emphasis": {
              "shadowBlur": 5,
              "shadowColor": "rgba(0,0,0,0.71)"
            },
            "borderWidth": 0.5,
            "borderType": "solid",
            "borderColor": "#ffffff"
          }
        }]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);

    },
    initChart5() {
      var myChart = echarts.init(document.getElementById('achart5'));
      // 指定图表的配置项和数据
      var dataStore = [
        {
          name: 'Disease Novelty',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Disease Novelty',
          first: 10,
          second: 50,
          third: 70,
          fourth: 90
        }, {
          name: 'Disease Novelty',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Disease Novelty',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Disease Novelty',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        },
      ];
      var series = [];
      dataStore.forEach((item, index) => {
        let data = [];
        data.push({
          name: 'Novelty',
          value: item.first,
          offset: [10, 10 + index]
        })
        data.push({
          name: 'Novelty',
          value: item.second,
          offset: [10, 10 + 2 + index]
        })
        data.push({
          name: 'Novelty',
          value: item.third,
          offset: [10, 10 + 3 + index]
        })
        data.push({
          name: 'Novelty',
          value: item.fourth,
          offset: [10, 10 + 4 + index]
        })
        series.push({
          name: item.name,
          data: data
        })
      })

      let option = {
        xAxis: {
          "axisLabel": {
            "interval": 0,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
        },
        yAxis: {
          "axisLabel": {
            "interval": 0,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
        },
        tooltip: {
          show: true
        },
        series: series.map(item => {
          return {
            type: 'scatter',
            data: item.data,
            name: item.name
          }
        })
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);

    },
    initChart6() {
      var myChart = echarts.init(document.getElementById('last_chart'));
      // 指定图表的配置项和数据
      var dataStore = [
        {
          name: 'Odds Ratio',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Odds Ratio',
          first: 10,
          second: 50,
          third: 70,
          fourth: 90
        }, {
          name: 'Odds Ratio',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Odds Ratio',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        }, {
          name: 'Odds Ratio',
          first: 25,
          second: 35,
          third: 45,
          fourth: 55
        },
      ];
      var series = [];
      dataStore.forEach((item, index) => {
        let data = [];
        data.push({
          name: 'EFO_0009765',
          value: item.first,
          offset: [10, 10 + index]
        })
        data.push({
          name: 'EFO_0009766',
          value: item.second,
          offset: [10, 10 + 2 + index]
        })
        data.push({
          name: 'EFO_0009767',
          value: item.third,
          offset: [10, 10 + 3 + index]
        })
        data.push({
          name: 'EFO_0009768',
          value: item.fourth,
          offset: [10, 10 + 4 + index]
        })
        series.push({
          name: item.name,
          data: data
        })
      })

      let option = {
        xAxis: {
          "axisLabel": {
            "interval": 0,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
        },
        yAxis: {
          "axisLabel": {
            "interval": 0,
            "fontSize": "0.14rem",
            "color": "#606060"
          },
        },
        tooltip: {
          show: true
        },
        series: series.map(item => {
          return {
            type: 'scatter',
            data: item.data,
            name: item.name
          }
        })
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);

    },
    goPage(path) {
      if (path === 'aiPage') {
        window.location.href = 'aiPage.html'
      } else if (path === 'Target') {
        window.location.href = 'index_v2.html'
      } else if (path === 'uploadTarget') {
        window.location.href = 'uploadTarget.html'
      }else if(path==='Homepage'){
        window.location.href = '../gateway/index.html'
     }
    }
  },
});