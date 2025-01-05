function setRem() {
  const scale = (document.documentElement.clientHeight + 1) / 1080
  document.documentElement.style.fontSize = (scale) * 100 + 'px'
}
setRem()
window.onresize = function () {
  setRem()
}