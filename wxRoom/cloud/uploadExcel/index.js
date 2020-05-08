// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let fileInfoList = event.file_info
    let fileName = event.file_name

    //1,定义excel表格名
    let dataCVS = 'excel/找新房_' + fileName + '.xlsx'

    //2，定义存储数据的
    let alldata = [];
    let row = ['楼栋', '单元', '房号', '建筑面积(平方米)', '套内面积(平方米)', '建面单价(万)', '套内单价(万)', '总价(万)', '户型', '用途'];
    alldata.push(row);

    let i = 0
    for (i = 0; i < fileInfoList.length; i++) {
      let arr = [];
      arr.push(fileInfoList[i].build);
      arr.push(fileInfoList[i].unit);
      arr.push(fileInfoList[i].room);
      arr.push(fileInfoList[i].square_all);
      arr.push(fileInfoList[i].square_in);
      arr.push(fileInfoList[i].price_all);
      arr.push(fileInfoList[i].price_in);
      arr.push(fileInfoList[i].price_total);
      arr.push(fileInfoList[i].type);
      arr.push(fileInfoList[i].func);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "找新房_" + fileName,
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}