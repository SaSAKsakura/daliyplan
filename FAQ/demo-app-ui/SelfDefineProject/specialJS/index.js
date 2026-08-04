// 自定义JS
let selfDefineMethods = {
  print() {
    alert('自定义JS触发了')
  },
};
if (!window.erowSpecial) {
  window.erowSpecial = {}
}
Object.assign(window.erowSpecial, selfDefineMethods);
