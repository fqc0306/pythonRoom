var selected = {}
function filterTab(e, that) {
  var data = JSON.parse(JSON.stringify(that.data.tabTxt));
  var index = e.currentTarget.dataset.index;
  var newTabTxt = data.map(function (e) {
    e.active = false;
    return e;
  });
  newTabTxt[index].active = !that.data.tabTxt[index].active;
  that.setData({
    tabTxt: data
  })

}
function filterTabChild(e, that, callback) {

  //我需要切换选中项 修改展示文字 并收回抽屉  
  var index = e.currentTarget.dataset.index;
  var data = JSON.parse(JSON.stringify(that.data.tabTxt));
  if (typeof (e.target.dataset.id) == 'undefined' || e.target.dataset.id == '') {
    data[index].active = !that.data.tabTxt[index].active;
  }
  else {
    data[index].type = e.target.dataset.id;
    data[index].active = !that.data.tabTxt[index].active;
    if (e.target.dataset.id == '0') {
      data[index].text = that.data.tabTxt[index].originalText;
      //不限删除条件
      delete that.data.filterParam[index];
      delete selected[data[index].key]
      if (data[index].key == "project") {
        delete selected["build"]
        delete selected["unit"]
      } else if (data[index].key == "build") {
        delete selected["unit"]
      }
    }
    else {
      data[index].text = e.target.dataset.txt;
      //更改删除条件
      that.data.filterParam[index] = data[index].text;
      selected[data[index].key] = data[index].text
      if (data[index].key == "project") {
        delete selected["build"]
        delete selected["unit"]
      } else if (data[index].key == "build") {
        delete selected["unit"]
      }
    }
  }

  that.setData({
    tabTxt: data
  })
  console.log(that.data.filterParam);
  callback(selected)
}

module.exports = {
  filterTab: filterTab,
  filterTabChild: filterTabChild,
}