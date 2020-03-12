// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {

  const res = await cloud.downloadFile({
    fileID: 'cloud://zhaoxinfang-i5zft.7a68-zhaoxinfang-i5zft-1301400512/qingnian1.json',
  })
  const buffer = res.fileContent

  console.info(buffer.toString('utf8'))
  return buffer.toString('utf8')
}