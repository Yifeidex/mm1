// 创建一个Vue实例
new Vue({
  el: '#app',
  data: {
    activeIndex: '1',
  },
  created() {

  },
  mounted() {

  },
  methods: {
    goPage(path) {
      if (path === 'aiPage') {
        window.location.href = 'aiPage.html'
      } else if (path === 'Target') {
        window.location.href = 'index_v2.html'
      } else if (path === 'uploadTarget') {
        window.location.href = 'uploadTarget.html'
      } else if (path === 'Homepage') {
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