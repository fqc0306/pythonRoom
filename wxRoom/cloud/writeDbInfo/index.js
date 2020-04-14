// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  const myDate = new Date()
  const mytime = myDate.toLocaleTimeString() //获取当前时间
  const currentTimeStr = myDate.toLocaleString() //获取日期与时间

  return db.collection(event.file_id).add({
    data: {
      nick_name: event.userInfo.nickName,
      city: event.userInfo.city,
      province: event.userInfo.province,
      gender: event.userInfo.gender,
      user_info: event.userInfo,
      create_time: currentTimeStr
    }
  }).then(res => {
    console.info("res:", res)
  })
}